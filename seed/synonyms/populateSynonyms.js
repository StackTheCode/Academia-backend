const synonymsService = require('../../src/modules/synonyms/services');
const utils = require('../../crawlers/utils');
const logger = require('../../src/config/logger');
const synonyms = require('./synonyms.json');

async function populateSynonyms() {
  try {
    for (const synonym of synonyms) {
      await synonymsService.createSynonym(synonym);
      logger.info(`Created ${synonym.name}`);
    }
    logger.info('All synonyms populated.');
  } catch (err) {
    logger.error('Error creating synonyms:', err);
  }
}

(async () => {
  await utils.mongoose_connection_open();
  await populateSynonyms();
  await utils.mongoose_connection_close();
})();
