const professorService = require('./services');
const logger = require('../../config/logger');

exports.getAllProfessors = async (req, res) => {
  try {
    const { collegeId, departmentId, q, page = 1, per_page = 10 } = req.query;
    const result = await professorService.getAllProfessors({
      collegeId,
      departmentId,
      q,
      page: parseInt(page),
      per_page: parseInt(per_page),
    });
    res.json(result);
  } catch (err) {
    logger.error(`Failed to fetch professors: ${err}`);
    res.status(500).json({ error: `Failed to fetch professors: ${err}` });
  }
};

exports.createProfessor = async (req, res) => {
  try {
    const professor = await professorService.createProfessor(req.body);
    res.status(201).json(professor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getProfessorById = async (req, res) => {
  try {
    const professor = await professorService.getProfessorById(req.params.id);
    if (!professor) return res.status(404).json({ error: 'Professor not found' });
    res.json(professor);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateProfessor = async (req, res) => {
  try {
    const updated = await professorService.updateProfessor(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteProfessor = async (req, res) => {
  try {
    await professorService.deleteProfessor(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Deletion failed' });
  }
};

exports.getProfessorsByIds = async (req, res) => {
  try {
    const professorIds = req.body;

    if (!Array.isArray(professorIds)) {
      return res.status(400).json({ error: 'Request body must be an array of IDs' });
    }

    const professors = await professorService.getAllProfessorsByIds(professorIds);
    res.status(200).json(professors);
  } catch (err) {
    logger.error('Error fetching professors:', err);
    res.status(500).json({ error: err.message });
  }
};
