const axios = require('axios');
const cheerio = require('cheerio');
const collegeService = require('../../src/modules/colleges/services');
const professorsService = require('../../src/modules/professors/services');
const utils = require('../utils');
const logger = require('../../src/config/logger');

const URL = 'https://www.cse.iitm.ac.in/listpeople.php?arg=MSQw';
const BASE_URL = 'https://www.cse.iitm.ac.in/';

async function scrapeProfilesCSE() {
  try {
    const { data } = await axios.get(URL);
    const $ = cheerio.load(data);

    const links = [];

    $('.wrapper.row5 table tr').each((i, row) => {
      const tds = $(row).find('td');

      tds.each((j, td) => {
        const anchor = $(td).find('a').first();
        const href = anchor.attr('href');

        if (href) {
          links.push(BASE_URL + href);
        }
      });
    });

    async function fetchProfile(url) {
      try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        // Name
        const name = $('span strong').first().text().trim();

        // Designation
        const tdContent = $('td[width="600"]').html();
        let designation = 'Not found';
        if (tdContent) {
          const parts = tdContent.split('<br>');
          if (parts.length > 1) {
            const textAfterBr = cheerio.load(parts[1]).text().trim();
            designation = textAfterBr.replace(/\|.*/, '').trim();
          }
        }

        // Email
        const rawEmailLine = $('td[width="600"]').html();
        const emailMatch = rawEmailLine.match(/Email\s*:\s*(.*?)(\||<|$)/i);

        let email = '';
        if (emailMatch && emailMatch[1]) {
          email = emailMatch[1]
            .replace(/\[at\]/gi, '@')
            .replace(/\[dot\]/gi, '.')
            .replace(/&nbsp;/gi, ' ')
            .replace(/\s+/g, '') // remove all whitespace
            .trim();
        }

        // Personal website link
        const homepageAnchor = $('a.aclass[href^="http"]').filter(function () {
          return $(this).text().toLowerCase().includes('personal');
        });
        const personalWebsite = homepageAnchor.attr('href') || 'Not available';

        // Research Interests
        const researchText = $('#Areas').text().replace('Research Interests :', '').trim();

        return {
          name,
          designation,
          email,
          personalWebsite,
          researchInterests: researchText,
        };
      } catch (error) {
        logger.error(`Error fetching ${url}:`, error.message);
        return null;
      }
    }

    let results = [];
    // Process all links
    for (const link of links) {
      const data = await fetchProfile(link);
      if (data) {
        results.push({ ...data, college_website: link });
      }
    }
    logger.info(`Number of professors: ${results.length}`);
    return results;
  } catch (err) {
    logger.error('Error fetching page:', err.message);
    return null;
  }
}
async function insertInDB() {
  const depid = await utils.departmentCheck('CSE');
  const id = await utils.collegeCheck('IIT Madras');
  const updatedCollege = await collegeService.updateCollege(
    id,
    { $addToSet: { departments: depid } } // $push if duplicates allowed
  );
  logger.info('Crawling IIT Madras, CSE');
  const list = await scrapeProfilesCSE();
  for (const prof of list) {
    try {
      const prof_data = {
        name: prof.name,
        email: prof.email,
        collegeId: id,
        departmentId: depid,
        researchInterests: [prof.researchInterests.trim()],
        personal_website: prof.personalWebsite,
        position: prof.designation,
        college_website: prof.college_website,
      };
      const createdProf = await professorsService.createProfessor(prof_data);
      logger.info(`Created: ${createdProf.name}`);
    } catch (err) {
      logger.error(`Error creating ${prof.name}:`, err.message);
    }
  }
  logger.info('Done');
}

(async () => {
  await utils.mongoose_connection_open();
  await insertInDB();
  await utils.mongoose_connection_close();
})();
