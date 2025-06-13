const professorService = require('./services');

exports.getAllProfessors = async (req, res) => {
  try {
    const { collegeId, departmentId } = req.query;
    console.log(departmentId);
    const professors = await professorService.getAllProfessors({ collegeId, departmentId });
    res.json(professors);
  } catch (err) {
    console.log(`${err}`);
    res.status(500).json({ error: 'Failed to fetch professors: ${err}' });
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
