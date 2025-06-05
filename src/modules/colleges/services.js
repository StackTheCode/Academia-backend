const College = require('./models');

exports.getAllColleges = async () => College.find();

exports.createCollege = async (data) => College.create(data);

exports.getCollegeById = async (id) => College.findById(id);

exports.updateCollege = async (id, data) => College.findByIdAndUpdate(id, data, { new: true });

exports.deleteCollege = async (id) => College.findByIdAndDelete(id);
