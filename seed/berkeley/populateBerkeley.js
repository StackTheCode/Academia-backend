const professorsService = require('../../src/modules/professors/services');
const collegesService = require('../../src/modules/colleges/services');
const utils = require('../../crawlers/utils');
const logger = require('../../src/config/logger');
const professors = require('./berkeley.json');

function sanitizeField(value) {
  if (!value || typeof value !== 'string' || value.trim() === '') return 'Unavailable';
  return value.trim();
}

let unavailableEmailCounter = 1;

function sanitizeProfessor(prof) {
  let email = (prof.email || '').trim();
  if (!email) {
    email = `unavailable-${unavailableEmailCounter++}@placeholder.edu`;
  }

  return {
    name: sanitizeField(prof.name),
    email,
    position: sanitizeField(prof.position),
    personal_website: sanitizeField(prof.personal_website),
    researchInterests:
      Array.isArray(prof.researchInterests) && prof.researchInterests.length > 0
        ? prof.researchInterests.map(sanitizeField)
        : ['Unavailable'],
    college_website: sanitizeField(prof.college_website),
  };
}

async function populateProfessors() {
  try {
    const depid = await utils.departmentCheck('CSE');
    const id = await utils.collegeCheck('UC Berkeley');

    await collegesService.updateCollege(id, { $addToSet: { departments: depid } });

    for (const professor of professors) {
      const cleanProf = sanitizeProfessor(professor);

      const professorWithRefs = {
        ...cleanProf,
        collegeId: id,
        departmentId: depid,
      };

      await professorsService.createProfessor(professorWithRefs);
      logger.info(`Created ${cleanProf.name}`);
    }

    logger.info('All professors populated.');
  } catch (err) {
    logger.error('Error creating professors:', err);
  }
}

(async () => {
  await utils.mongoose_connection_open();
  await populateProfessors();
  await utils.mongoose_connection_close();
})();
