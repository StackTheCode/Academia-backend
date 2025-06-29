const axios = require('axios');
const cheerio = require('cheerio');
const collegeService = require('../../src/modules/colleges/services');
const professorsService = require('../../src/modules/professors/services');
const utils = require('../utils');
const logger = require('../../src/config/logger');

const baseUrl = 'https://www.ee.iitm.ac.in/faculty/';
async function scrapeProfilesEE() {
  try {
    const res = await axios.get(baseUrl);
    const $ = cheerio.load(res.data);

    const facultyLinks = [];

    $('div.lecturers-content-wrapper a[href]').each((_, el) => {
      let href = $(el).attr('href');

      // Ensure the href is not already absolute
      if (!href.startsWith('http')) {
        href = baseUrl + href.replace(/^\/+/, ''); // remove leading slash if present
      }

      facultyLinks.push(href);
    });

    //console.log(facultyLinks);
    async function extractProfessorDetails(url) {
      try {
        const res = await axios.get(url);
        const $ = cheerio.load(res.data);

        const name = $('div.name_designation h2').first().text().replace(/\s+/g, ' ').trim();

        const designation = $('div.name_designation h2.designation')
          .text()
          .replace(/\s+/g, ' ')
          .trim();

        const email =
          $('div.contact_details img[src*="mail"]').parent().find('p').text().trim() ||
          'Unavailable';

        let personalWebsite = 'Unavailable';
        $('div.contact_details img[src*="web"]').each((_, img) => {
          const parent = $(img).closest('div.education');
          const onclickHref = parent.find('a[onclick]').attr('onclick');
          const normalHref = parent.find('a[href]').attr('href');

          if (onclickHref) {
            const match = onclickHref.match(/window\.open\(['"](.+?)['"]/);
            if (match && match[1]) {
              personalWebsite = match[1];
              if (personalWebsite == "', ") personalWebsite = 'Unavailable';
              return false;
            }
          }

          if (normalHref && normalHref.startsWith('http')) {
            personalWebsite = normalHref;
            if (personalWebsite == "', ") personalWebsite = 'Unavailable';
            return false;
          }
        });

        let researchInterests = 'Unavailable';
        $('div.accordion-item').each((_, item) => {
          const heading = $(item).find('button.accordion-button span').text().toLowerCase();
          if (heading.includes('research')) {
            const interests = [];
            $(item)
              .find('ul li')
              .each((_, li) => {
                const text = $(li)
                  .text()
                  .replace(/\s+/g, ' ')
                  .trim()
                  .replace(/\s*\.\s*$/, ''); // remove trailing periods
                if (text) interests.push(text);
              });
            if (interests.length > 0) {
              researchInterests = interests.join('; ');
            }
            return false; // break the loop
          }
        });

        if (researchInterests === 'Unavailable') {
          $('div.accordion-item').each((_, item) => {
            const heading = $(item).find('button.accordion-button span').text().toLowerCase();
            const contentDiv = $(item).find('div.accordion-body');

            if (heading.includes('about')) {
              const aboutText = contentDiv
                .text()
                .replace(/\s+/g, ' ')
                .trim()
                .replace(/\s*\.\s*$/, '');
              if (aboutText) {
                researchInterests = aboutText;
              }
              return false; // break the loop
            }
          });
        }

        return {
          name,
          designation,
          email,
          personalWebsite,
          researchInterests,
        };
      } catch (err) {
        logger.error(`Failed to fetch ${url}: ${err.message}`);
        return null;
      }
    }

    // Immediately invoked async function (unnamed)
    let results = [];
    for (const url of facultyLinks) {
      const data = await extractProfessorDetails(url);
      if (data) {
        results.push({ ...data, college_website: url });
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
  const depid = await utils.departmentCheck('EE');
  const id = await utils.collegeCheck('IIT Madras');
  const updatedCollege = await collegeService.updateCollege(
    id,
    { $addToSet: { departments: depid } } // $push if duplicates allowed
  );
  logger.info('Crawling IIT Madras, EE');
  const list = await scrapeProfilesEE();
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
