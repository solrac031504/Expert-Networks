// backend/server.js
require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const path = require('path');

const express = require('express');
const cors = require('cors'); // Import cors package
const expertRoutes = require('./routes/experts');
const institutionRoutes = require('./routes/institutions');

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

// Routes for experts
app.use('/api/experts', expertRoutes);

// Routes for institutions
app.use('/api/institutions', institutionRoutes);

// Synchronize the database with the scheme
const syncDatabase = async() => {
  try {
    // force false prevents dropping tables upon starting server
    await sequelize.sync({ force: false}); 
    console.log('DB synced successfully');
    
    // listen to port
    app.listen(process.env.PORT, () => {
      console.log('listening for requests on port', process.env.PORT);
    })
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
