const express = require('express');
const cors = require('cors');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const { connect } = require('./config/db');
const { PORT, NODE_ENV } = require('./config/env');
const logger = require('./config/logger');
const swaggerUI = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const initTypesenseSchema = require('../scripts/init-typesense'); // ← add this
const {
  startProfessorChangeStream,
  startSynonymChangeStream,
  initSynonyms,
} = require('./utils/typesense');

require('./config/passport')(passport);

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: 'http://localhost:5173', // Frontend origin
    credentials: true,
  })
);

app.use(passport.initialize());

if (NODE_ENV === 'DEV') {
  app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));
}

// Routes
app.use('/api/colleges', require('./modules/colleges/routes'));
app.use('/api/departments', require('./modules/departments/routes'));
app.use('/api/professors', require('./modules/professors/routes'));
app.use('/api/auth', require('./modules/users/routes'));
app.use('/api/synonyms', require('./modules/synonyms/routes'));
app.use('/api/user-prof', require('./modules/user_prof_table/routes'));

// Start server after DB + Typesense are ready
connect()
  .then(async () => {
    logger.info('✅ MongoDB connected');

    // Initialize Typesense schema only if it doesn’t exist
    await initTypesenseSchema();
    await initSynonyms(); // <- right after schema

    // Start listening for changes in MongoDB
    startProfessorChangeStream();
    startSynonymChangeStream();

    // Start Express server
    app.listen(PORT, () => logger.info(`🚀 Server started on port ${PORT}`));
  })
  .catch((err) => {
    logger.error('❌ Failed to start server:', err.message || err);
    process.exit(1);
  });
