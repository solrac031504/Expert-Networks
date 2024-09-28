const redis = require('redis');
require('dotenv').config();

// const redisClient = redis.createClient({
//   host: process.env.REDIS_HOST,
//   port: process.env.REDIS_PORT,
//   username: process.env.REDIS_USER,
//   password: process.env.REDIS_PSWD,
//   tls: true
// });

const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true
  }
});

redisClient.on('error', (err) => {
  console.log('Redis error: ', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

module.exports = redisClient;