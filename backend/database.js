require('dotenv').config();
// Connect to the DB
const { Sequelize } = require ('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PSWD, {
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT,
  port: process.env.DB_PORT,
  ssl: process.env.DB_SSL,
  pooling: {
    max: 10,
    min: 0,
    acquire: 60000, // 60 sec
    evict: 60000,    // if a connection is idle, evicted after 1 second
    idle: 60000     // a connection is idle if it hasn't been used in 10 seconds
  },
  logging: false
});

// Test if the connection is OK
sequelize.authenticate()
    .then(() => {
        console.log('Successfully connected to the DB.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

module.exports = sequelize;