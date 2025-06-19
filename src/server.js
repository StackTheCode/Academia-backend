// src/server.js
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const cookieParser = require('cookie-parser'); // <-- ADD THIS
const { connect } = require('./config/db');
const { PORT, NODE_ENV } = require('./config/env');
const logger = require('./config/logger');
const swaggerUI = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

require('./config/passport')(passport);
connect();

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: 'http://localhost:5173', // your frontend port
    credentials: true,
  })
);

app.use(passport.initialize());

if (NODE_ENV === 'DEV') {
  app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));
}

app.use('/api/colleges', require('./modules/colleges/routes'));
app.use('/api/departments', require('./modules/departments/routes'));
app.use('/api/professors', require('./modules/professors/routes'));
app.use('/api/auth', require('./modules/users/routes'));

app.listen(PORT, () => logger.info(`Server Start at ${PORT}`));
