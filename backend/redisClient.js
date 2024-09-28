const redis = require('redis');
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  tls: {}  // Required for Managed Redis with SSL
});

redisClient.on('error', (err) => {
  console.log('Redis error: ', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

module.exports = redisClient;