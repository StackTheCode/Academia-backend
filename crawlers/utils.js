require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bluebird = require('bluebird');
const logger = require('../src/config/logger');
const collegeService = require('../src/modules/colleges/services');
const departmentsService = require('../src/modules/departments/services');

async function mongoose_connection_open() {
  const MONGO_URI = process.env.MONGO_URI_LOCALHOST;
  mongoose.Promise = bluebird;

  mongoose.connection.on('error', (err) => {
    logger.error(`MongoDB Connection Failed: ${err}`);
    process.exit(-1);
  });

  await mongoose.connect(MONGO_URI, {});
  logger.info('MongoDB Connection Established for crawler');
}

async function mongoose_connection_close() {
  await mongoose.connection.close();
}

async function departmentCheck(departmentName) {
  const departmentList = await departmentsService.getAllDepartments();
  const dep = departmentList.find((c) => c.name == departmentName);
  let depid = null;
  if (dep) depid = dep._id;
  else {
    depid = (await departmentsService.createDepartment({ name: departmentName }))._id;
  }
  return depid;
}

async function collegeCheck(collegeName) {
  const collegesList = await collegeService.getAllColleges();
  const college = collegesList.find((c) => c.name == collegeName);
  let id = null;
  if (college) {
    id = college._id;
  } else {
    id = (await collegeService.createCollege({ name: collegeName }))._id;
  }
  return id;
}
module.exports = {
  mongoose_connection_open,
  departmentCheck,
  collegeCheck,
  mongoose_connection_close,
};
