const synonymService = require('./services');

exports.getAllSynonyms = async (req, res) => {
  try {
    const synonyms = await synonymService.getAllSynonyms();
    res.json(synonyms);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch synonyms' });
  }
};

exports.createSynonym = async (req, res) => {
  try {
    const synonym = await synonymService.createSynonym(req.body);
    res.status(201).json(synonym);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getSynonymById = async (req, res) => {
  try {
    const synonym = await synonymService.getSynonymById(req.params.id);
    if (!synonym) return res.status(404).json({ error: 'Synonym not found' });
    res.json(synonym);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateSynonym = async (req, res) => {
  try {
    const updated = await synonymService.updateSynonym(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteSynonym = async (req, res) => {
  try {
    await synonymService.deleteSynonym(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Deletion failed' });
  }
};
