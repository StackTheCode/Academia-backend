const UserProf = require('./models');

exports.getAllUserProfEntries = async () => UserProf.find();

exports.createUserProfEntry = async (data) => UserProf.create(data);

exports.getUserProfEntryById = async (id) => UserProf.findById(id);

exports.getUserProfEntriesByUserId = async (userId) => UserProf.find({ userId });

exports.getUserProfEntriesByProfessorId = async (professorId) => UserProf.find({ professorId });

exports.updateUserProfEntry = async (id, data) =>
  UserProf.findByIdAndUpdate(id, data, { new: true });

exports.deleteUserProfEntry = async (id) => UserProf.findByIdAndDelete(id);
