const mongoose = require('mongoose');
const { MONGO_URI, NODE_ENV } = require('./env');
const bluebird = require('bluebird');
const logger = require('./logger');

mongoose.Promise = bluebird;

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB Connection Failed: ${err}`);
  process.exit(-1);
});

if (NODE_ENV === 'DEV') {
  mongoose.set('debug', true);
}

exports.connect = () => {
  mongoose.connect(MONGO_URI, {}).then(() => logger.info(`MongoDB Connection Established`));
  return mongoose.connection;
};
