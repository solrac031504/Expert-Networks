// backend/server.js
require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const path = require('path');

const express = require('express');
const cors = require('cors'); // Import cors package
const redisClient = require('./redisClient');

// Routes
const expertRoutes = require('./routes/experts');
const institutionRoutes = require('./routes/institutions');
const institutionImportRoutes = require('./routes/institutionsImport');
const dropdownMenuRoutes = require('./routes/dropdown_menus');
const searchRoutes = require('./routes/searches');
const downloadRoutes = require('./routes/downloads');
const dataScrapingRoutes = require('./routes/datascrapes.js');
const csvImportRoutes = require('./routes/csvImport');

// for DB
const sequelize = require('./database');

const Expert = require('./models/Expert');
const Institution = require('./models/Institution');

const Continent = require('./models/Continent');
const Region = require('./models/Region');
const Subregion = require('./models/Subregion');
const Country = require('./models/Country');

const Domain = require('./models/Domain');
const Field = require('./models/Field');
const Subfield = require('./models/Subfield');
const Topic = require('./models/Topic');
const Author = require('./models/Author');
const AuthorTopic = require('./models/AuthorTopic');

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

// Routes for importing institution information
app.use('/api/import', institutionImportRoutes);

// Routes for the dropdown menus
app.use('/api/dropdown', dropdownMenuRoutes);

// Routes for the search and table
app.use('/api/search', searchRoutes);

// Routes for download fucntions
app.use('/api/download', downloadRoutes);

// Routes for data scraping
app.use('/api/data', dataScrapingRoutes);

// Routes for importing OpenAlex data from CSV
app.use('/api/csv-import', csvImportRoutes);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV === 'production') {
  // Serve static files from the 'build' directory
  app.use(express.static(path.join(__dirname, 'build')));
  // console.log("Serving static files from build directory in backned");

  // Catch-all handler to serve the React app for any route not handled by the backend API
  app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
    });
}

redisClient.connect();

// Synchronize the database with the scheme
const syncDatabase = async() => {
  try {
    // "force" deletes a table if it already exists
    // "alter" alters the table every time
    await sequelize.sync({ force: false, alter: false }); 
    console.log('DB synced successfully');
    
    // listen to port
    app.listen(PORT, () => {
      console.log('Server listening for requests on port', PORT);
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
