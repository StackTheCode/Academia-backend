const axios = require('axios');
const cheerio = require('cheerio');
const collegeService = require('../../modules/colleges/services');
const professorsService = require('../../modules/professors/services');
const utils = require('../utils');
const logger = require('../../config/logger');

const baseUrl = 'https://mech.iitm.ac.in/';
const targetUrl = baseUrl + 'faculty.php';
async function scrapeProfilesMech() {
  try {
    const { data } = await axios.get(targetUrl);
    const $ = cheerio.load(data);

    const facultyLinks = [];

    $('div.lecturers-content-wrapper.h-100 a[href]').each((_, el) => {
      const relativeHref = $(el).attr('href');
      if (relativeHref) {
        const fullUrl = new URL(relativeHref, baseUrl).href;
        facultyLinks.push(fullUrl);
      }
    });

    async function scrapeProfile(url) {
      try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const name = $('div.name_designation h2').first().text().trim();
        const designation = $('div.name_designation h2.designation').text().trim();

        // Email
        const email = $('div.contact_details img[src*="mail.png"]')
          .parent()
          .find('p')
          .text()
          .replace(/\[at\]/g, '@')
          .replace(/\[\.\]/g, '.')
          .trim();

        // Personal Website (if present, optional)
        let personalWebsite = 'Unavailable';

        $('div.contact_details img[src*="web.png"]').each((_, img) => {
          const parent = $(img).parent();

          // Case 1: onclick="window.open('...')"
          const onclickAnchor = parent.find('a[onclick]');
          if (onclickAnchor.length) {
            const onclick = onclickAnchor.attr('onclick');
            const match = onclick.match(/window\.open\(['"](.+?)['"]/);
            if (match && match[1]) {
              personalWebsite = match[1];
              return false; // break out of .each
            }
          }

          // Case 2: direct href like <a href="https://...">Scopus ID</a>
          const hrefAnchor = parent.find('a[href^="http"]');
          if (hrefAnchor.length) {
            const href = hrefAnchor.attr('href').trim();
            if (href) {
              personalWebsite = href;
              return false; // break out of .each
            }
          }
        });

        // Research Interests
        let researchInterests = 'Unavailable';
        const researchHeader = $('button span')
          .filter((_, el) => $(el).text().trim().toLowerCase().includes('research'))
          .closest('button');

        if (researchHeader.length) {
          const parent = researchHeader.closest('.accordion-item');
          researchInterests = parent
            .find('.accordion-body li')
            .map((_, el) => $(el).text().trim())
            .get()
            .join('; ');
        }

        return {
          name,
          designation,
          email,
          personalWebsite,
          researchInterests,
        };
      } catch (err) {
        logger.error(`Error fetching ${url}:`, err.message);
        return null;
      }
    }

    let results = [];

    for (const link of facultyLinks) {
      const profile = await scrapeProfile(link);
      if (profile) results.push(profile);
    }

    return results;
  } catch (err) {
    logger.error('Error fetching page:', err.message);
  }
}

async function insertInDB() {
  const depid = await utils.departmentCheck('Mech');
  const id = await utils.collegeCheck('IIT Madras');
  const updatedCollege = await collegeService.updateCollege(
    id,
    { $addToSet: { departments: depid } } // $push if duplicates allowed
  );
  logger.info('Crawling IIT Madras, Mech');
  const list = await scrapeProfilesMech();
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
