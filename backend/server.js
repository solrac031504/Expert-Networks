// backend/server.js
require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const path = require('path');

const express = require('express');
// const mongoose = require('mongoose');
const cors = require('cors'); // Import cors package
// const expertRoutes = require('./routes/experts');

// for DB
const sequelize = require ('./database');
const Expert = require('./models/Expert');
const Institution = require('./models/Institution');

// express app
const app = express();

// Enable CORS
app.use(cors());

app.use(express.json());

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// routes
// app.use('/api/experts', expertRoutes);

// connect to db (Mongo, previous DB)
/*
console.log('MONGO_URI:', process.env.MONGO_URI); // Debugging line
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('connected to database');
    // listen to port
    app.listen(process.env.PORT, () => {
      console.log('listening for requests on port', process.env.PORT);
    });
  })
  .catch((err) => {
    console.log(err);
  }); */


const syncDatabase = async() => {
  try {
    await sequelize.sync({ force: true});
    console.log('DB synced successfully');
  }
  catch(error) {
    console.error('Error syncing database:', error);
  }
}

syncDatabase();

// Create exports directory 
const exportDir = path.join(__dirname, 'exports');
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir);
}
