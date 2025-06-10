const { PORT } = require('../config/env');

module.exports = {
  ensureAuth: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      res.redirect(`http://localhost:${PORT}`);
    }
  },
  ensureGuest: function (req, res, next) {
    if (req.isAuthenticated()) {
      res.redirect(`http://localhost:${PORT}/dashboard`);
    } else {
      return next();
    }
  },
};
