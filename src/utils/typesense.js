const Professor = require('../modules/professors/models');
const Synonym = require('../modules/synonyms/models');
const typesenseClient = require('../config/typesense');
const logger = require('../config/logger');

async function startProfessorChangeStream() {
  const changeStream = Professor.watch([], { fullDocument: 'updateLookup' });

  changeStream.on('change', async (change) => {
    try {
      const doc = change.fullDocument;

      switch (change.operationType) {
        case 'insert':
        case 'update': {
          const typesenseDoc = {
            id: doc._id.toString(),
            name: doc.name,
            email: doc.email,
            collegeId: doc.collegeId.toString(),
            departmentId: doc.departmentId.toString(),
            researchInterests: doc.researchInterests,
            position: doc.position || '',
            personal_website: doc.personal_website || '',
          };
          await typesenseClient.collections('professors').documents().upsert(typesenseDoc);
          logger.info(`[Typesense] ${change.operationType}d professor: ${doc.name}`);
          break;
        }

        case 'delete': {
          const id = change.documentKey._id.toString();
          await typesenseClient.collections('professors').documents(id).delete();
          logger.info(`[Typesense] Deleted professor with ID: ${id}`);
          break;
        }

        default:
          logger.info(`[Typesense] Skipped operation: ${change.operationType}`);
      }
    } catch (err) {
      logger.error('[Typesense Sync Error]', err.message);
    }
  });

  logger.info('🔁 Started MongoDB Change Stream for Professors.');
}

async function startSynonymChangeStream() {
  const changeStream = Synonym.watch([], { fullDocument: 'updateLookup' });

  changeStream.on('change', async (change) => {
    try {
      const doc = change.fullDocument;
      const id = doc.name; // use `name` as synonym ID in Typesense

      switch (change.operationType) {
        case 'insert':
        case 'update':
          if (doc.active) {
            await typesenseClient.collections('professors').synonyms().upsert(id, {
              synonyms: doc.synonyms,
            });
            logger.info(`[Typesense] Upserted synonym: ${id}`);
          } else {
            try {
              await typesenseClient.collections('professors').synonyms(id).delete();
              logger.info(`[Typesense] Deleted synonym (marked inactive): ${id}`);
            } catch (e) {
              logger.info(`[Typesense] Synonym "${id}" not found for deletion.`);
            }
          }
          break;

        case 'delete':
          await typesenseClient.collections('professors').synonyms(id).delete();
          logger.info(`[Typesense] Deleted synonym: ${id}`);
          break;

        default:
          logger.info(`[Typesense] Skipped operation: ${change.operationType}`);
      }
    } catch (err) {
      logger.error('[Typesense Sync Error - Synonym]', err.message);
    }
  });

  logger.info('🔁 Started MongoDB Change Stream for Synonyms.');
}

async function initSynonyms() {
  try {
    const synonyms = await Synonym.find({ active: true });

    for (const synonym of synonyms) {
      try {
        // Check if it already exists in Typesense
        await typesenseClient.collections('professors').synonyms(synonym.name).retrieve();

        logger.info(`ℹ️ Synonym "${synonym.name}" already exists in Typesense, skipping...`);
      } catch (err) {
        if (err.message?.includes('404')) {
          // Does not exist, so insert it
          await typesenseClient.collections('professors').synonyms().upsert(synonym.name, {
            synonyms: synonym.synonyms,
          });

          logger.info(`✅ Synonym "${synonym.name}" inserted into Typesense`);
        } else {
          logger.error(`❌ Error checking synonym "${synonym.name}":`, err.message);
        }
      }
    }
  } catch (err) {
    logger.error('❌ Error initializing synonyms from DB:', err.message);
  }
}

module.exports = {
  startProfessorChangeStream,
  startSynonymChangeStream,
  initSynonyms,
};
