// src/server.js
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const { connect } = require('./config/db');
const { PORT, NODE_ENV, SESSION_SECRET } = require('./config/env');
const logger = require('./config/logger');
const swaggerUI = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const path = require('path');
const { ensureAuth, ensureGuest } = require('./middleware/auth');

require('./config/passport')(passport);
connect();

const app = express();
app.use(express.json());
app.use(cors());

//Session Middleware
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

if (NODE_ENV === 'DEV') {
  app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

  app.use(express.static('.'));
  app.get('/', ensureGuest, (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });
  app.get('/dashboard', ensureAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
  });
}

app.use('/api/colleges', require('./modules/colleges/routes'));
app.use('/api/departments', require('./modules/departments/routes'));
app.use('/api/professors', require('./modules/professors/routes'));
app.use('/api/auth', require('./modules/users/routes'));

// Your routes go here
// app.use('/api', require('./api'));

app.listen(PORT, () => logger.info(`Server Start at ${PORT}`));
