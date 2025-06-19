const client = require('../config/typesense'); // use your configured client

const synonyms = [
  {
    id: 'cybersecurity-synonyms',
    synonyms: ['cybersecurity', 'security', 'cyber-physical security', 'information security'],
  },
  {
    id: 'ai-synonyms',
    synonyms: ['ai', 'artificial intelligence', 'machine learning'],
  },
  {
    id: 'ml-synonyms',
    synonyms: ['ml', 'machine learning', 'deep learning'],
  },
];

async function initSynonyms() {
  for (const synonym of synonyms) {
    try {
      // Delete if exists
      await client.collections('professors').synonyms(synonym.id).delete();
    } catch (_) {
      // ignore if doesn't exist
    }

    // Create synonym
    await client.collections('professors').synonyms().upsert(synonym.id, {
      synonyms: synonym.synonyms,
    });

    console.log(`✅ Synonym "${synonym.id}" added`);
  }
}

module.exports = initSynonyms;
