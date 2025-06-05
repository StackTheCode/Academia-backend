const Department = require('./models');

exports.getAllDepartments = async () => Department.find();

exports.createDepartment = async (data) => Department.create(data);

exports.getDepartmentById = async (id) => Department.findById(id);

exports.updateDepartment = async (id, data) =>
  Department.findByIdAndUpdate(id, data, { new: true });

exports.deleteDepartment = async (id) => Department.findByIdAndDelete(id);
