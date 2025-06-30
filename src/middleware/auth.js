const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.sendStatus(401);
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user; // user object you encoded during jwt.sign()
    next();
  });
};

module.exports = authenticateJWT;
