// src/server.js
const express = require('express');
const cors = require('cors');
const { connect } = require('./config/db');
const { PORT, NODE_ENV } = require('./config/env');
const logger = require('./config/logger');
const swaggerUI = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

connect();

const app = express();
app.use(express.json());
app.use(cors());

if (NODE_ENV === 'DEV') {
  app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));
}

app.use('/api/users', require('./modules/users/routes'));
app.use('/api/colleges', require('./modules/colleges/routes'));
app.use('/api/departments', require('./modules/departments/routes'));
app.use('/api/professors', require('./modules/professors/routes'));

// Your routes go here
// app.use('/api', require('./api'));

app.listen(PORT, () => logger.info(`Server Start at ${PORT}`));
