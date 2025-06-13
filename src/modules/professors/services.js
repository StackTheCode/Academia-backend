const Professor = require('./models');

exports.getAllProfessors = async (filters) => {
  const query = {};
  if (filters.collegeId) {
    query.collegeId = filters.collegeId;
  }
  if (filters.departmentId) {
    query.departmentId = filters.departmentId;
  }
  return await Professor.find(query).populate('collegeId departmentId');
};

exports.createProfessor = async (data) => Professor.create(data);

exports.getProfessorById = async (id) => Professor.findById(id).populate('collegeId departmentId');

exports.updateProfessor = async (id, data) => Professor.findByIdAndUpdate(id, data, { new: true });

exports.deleteProfessor = async (id) => Professor.findByIdAndDelete(id);
