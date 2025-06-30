const client = require('../src/config/typesense');
const axios = require('axios');
const logger = require('../src/config/logger');
async function waitForTypesense(retries = 15, delay = 2000) {
  for (let i = 1; i <= retries; i++) {
    try {
      const res = await axios.get('http://typesense:8108/health');
      if (res.data?.ok) {
        logger.info('✅ Typesense is ready');
        return;
      }
    } catch (err) {
      logger.info(`⏳ Waiting for Typesense (${i}/${retries})...`);
    }
    await new Promise((r) => setTimeout(r, delay));
  }
  throw new Error('❌ Typesense did not become ready in time');
}

async function initTypesenseSchema() {
  await waitForTypesense();

  try {
    await client.collections('professors').retrieve();
    logger.info('✅ Typesense collection "professors" already exists.');
  } catch (err) {
    if (err.message?.includes('404')) {
      await client.collections().create({
        name: 'professors',
        fields: [
          { name: 'id', type: 'string' },
          { name: 'name', type: 'string' },
          { name: 'email', type: 'string' },
          { name: 'collegeId', type: 'string' },
          { name: 'departmentId', type: 'string' },
          { name: 'researchInterests', type: 'string[]' },
          { name: 'position', type: 'string', optional: true },
          { name: 'personal_website', type: 'string', optional: true },
        ],
      });
      logger.info('✅ Typesense collection "professors" created.');
    } else {
      logger.error('❌ Typesense schema init error:', err);
    }
  }
}

module.exports = initTypesenseSchema;
