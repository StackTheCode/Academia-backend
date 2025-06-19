const Professor = require('../modules/professors/models');
const typesenseClient = require('../config/typesense');

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
          console.log(`[Typesense] ${change.operationType}d professor: ${doc.name}`);
          break;
        }

        case 'delete': {
          const id = change.documentKey._id.toString();
          await typesenseClient.collections('professors').documents(id).delete();
          console.log(`[Typesense] Deleted professor with ID: ${id}`);
          break;
        }

        default:
          console.log(`[Typesense] Skipped operation: ${change.operationType}`);
      }
    } catch (err) {
      logger.error('[Typesense Sync Error]', err.message);
    }
  });

  console.log('🔁 Started MongoDB Change Stream for Professors.');
}

module.exports = startProfessorChangeStream;
