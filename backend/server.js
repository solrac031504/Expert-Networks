// backend/server.js
require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const path = require('path');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Import cors package
const expertRoutes = require('./routes/experts');

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
app.use('/api/experts', expertRoutes);

// connect to db
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
  });

// Create exports directory 
const exportDir = path.join(__dirname, 'exports');
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir);
}
