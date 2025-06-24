const userProfService = require('./services');

exports.getAllUserProfEntries = async (req, res) => {
  try {
    const entries = await userProfService.getAllUserProfEntries();
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
};

exports.createUserProfEntry = async (req, res) => {
  try {
    const newEntry = await userProfService.createUserProfEntry(req.body);
    res.status(201).json(newEntry);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create entry' });
  }
};

exports.getUserProfEntryById = async (req, res) => {
  try {
    const entry = await userProfService.getUserProfEntryById(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch entry' });
  }
};

exports.getUserProfEntriesByUserId = async (req, res) => {
  try {
    const entries = await userProfService.getUserProfEntriesByUserId(req.params.userId);
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user entries' });
  }
};

exports.getUserProfEntriesByProfessorId = async (req, res) => {
  try {
    const entries = await userProfService.getUserProfEntriesByProfessorId(req.params.professorId);
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch professor entries' });
  }
};

exports.updateUserProfEntry = async (req, res) => {
  try {
    const updated = await userProfService.updateUserProfEntry(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Entry not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update entry' });
  }
};

exports.deleteUserProfEntry = async (req, res) => {
  try {
    const deleted = await userProfService.deleteUserProfEntry(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Entry not found' });
    res.json({ message: 'Entry deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete entry' });
  }
};
