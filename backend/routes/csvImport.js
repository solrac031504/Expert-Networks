const express = require('express');
const {
  importTopicsCSV,
  importAuthorsCSV
} = require('../controllers/csvImportControllers');

const router = express.Router();

// Read OpenAlex topics from CSV and import them 
router.post('/topics', importTopicsCSV);

// Read OpenAlex authors from CSV and import them
router.post('/authors', importAuthorsCSV);

module.exports = router
