const professorsService = require('../src/modules/professors/services');
const departmentsService = require('../src/modules/departments/services');
const utils = require('./utils');
const logger = require('../src/config/logger');
const tags = require('./tags.json');

// Tag matching for research interests
function matchTags(paragraph, tagsList) {
  const matchedTags = [];
  for (const tag of tagsList) {
    const pattern = new RegExp(`\\b${tag}\\b`, 'i'); // match whole word, case-insensitive
    if (pattern.test(paragraph)) {
      matchedTags.push(tag);
    }
  }
  return matchedTags;
}

// Get tag list based on department name
function getTagsForDepartment(departmentName) {
  const deptEntry = tags.find((entry) => entry.department === departmentName);
  return deptEntry ? deptEntry.tags : [];
}

async function updateAllProfessorsWithTags() {
  try {
    const professors = await professorsService.getAllProfessors({});

    for (const professor of professors) {
      const department = await departmentsService.getDepartmentById(professor.departmentId);
      if (!department || !department.name) continue;

      const tagsList = getTagsForDepartment(department.name);
      const paragraph = (professor.researchInterests || []).join(' ');
      const matchedTags = matchTags(paragraph, tagsList);
      await professorsService.updateProfessor(professor._id, {
        researchInterests: matchedTags,
      });

      logger.info(`Updated ${professor.name} with tags: ${matchedTags.join(', ')}`);
    }
    logger.info('All professors updated with tags.');
  } catch (err) {
    logger.error('Error updating professors:', err);
  }
}

(async () => {
  await utils.mongoose_connection_open();
  await updateAllProfessorsWithTags();
  await utils.mongoose_connection_close();
})();
