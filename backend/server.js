// backend/server.js
require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const path = require('path');

const express = require('express');
const cors = require('cors'); // Import cors package

// Routes
const expertRoutes = require('./routes/experts');
const testExpertRoutes = require('./routes/testExperts');
const institutionRoutes = require('./routes/institutions');
const dropdownMenuRoutes = require('./routes/dropdown_menus');
const searchRoutes = require('./routes/searches');
// const downloadRoutes = require('./routes/downloads');
// const dataScrapingRoutes = require('./routes/searches');

// for DB
const sequelize = require ('./database');
const Expert = require('./models/Expert');
const Institution = require('./models/Institution');
const TestExpert = require('./models/TestExpert');

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

// Routes for the test experts
app.use('/api/testexperts', testExpertRoutes);

// Routes for institutions
app.use('/api/institutions', institutionRoutes);

// Routes for the dropdown menus
app.use('/api/dropdown', dropdownMenuRoutes);

// Routes for the search and table
app.use('/api/search', searchRoutes);

// Routes for download fucntions
// app.use('/api/download', downloadRoutes);

// Routes for data scraping
// app.use('/api/data', dataScrapingRoutes);

// Synchronize the database with the scheme
const syncDatabase = async() => {
  try {
    // "force" deletes a table if it already exists
    // "alter" alters the table every time
    await sequelize.sync({ force: false, alter: true }); 
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
