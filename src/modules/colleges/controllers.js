const collegeService = require('./services');

exports.getAllColleges = async (req, res) => {
  try {
    const colleges = await collegeService.getAllColleges();
    res.json(colleges);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch colleges' });
  }
};

exports.createCollege = async (req, res) => {
  try {
    const college = await collegeService.createCollege(req.body);
    res.status(201).json(college);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getCollegeById = async (req, res) => {
  try {
    const college = await collegeService.getCollegeById(req.params.id);
    if (!college) return res.status(404).json({ error: 'College not found' });
    res.json(college);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateCollege = async (req, res) => {
  try {
    const updated = await collegeService.updateCollege(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteCollege = async (req, res) => {
  try {
    await collegeService.deleteCollege(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Deletion failed' });
  }
};
