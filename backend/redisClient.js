const redis = require('redis');
const redisClient = redis.createClient({
  username: process.env.REDIS_USER,
  password: process.env.REDIS_PSWD,
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_HOST,
  tls: true
});

redisClient.on('error', (err) => {
  console.log('Redis error: ', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

module.exports = redisClient;