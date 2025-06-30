const { REDIS_HOST, REDIS_PORT } = require('./env');
const Redis = require('ioredis');
const logger = require('./logger');
const redis = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
});

redis.on('connect', () => {
  logger.info('✅ Connected to Redis');
});

redis.on('error', (err) => {
  logger.error('❌ Redis error:', err);
});

module.exports = redis;
