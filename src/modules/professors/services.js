const Professor = require('./models');

exports.getAllProfessors = async () => Professor.find().populate('college department');

exports.createProfessor = async (data) => Professor.create(data);

exports.getProfessorById = async (id) => Professor.findById(id).populate('college department');

exports.updateProfessor = async (id, data) => Professor.findByIdAndUpdate(id, data, { new: true });

exports.deleteProfessor = async (id) => Professor.findByIdAndDelete(id);
