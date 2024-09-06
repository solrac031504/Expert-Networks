const express = require('express');
const {
  importSubfieldsCSV,
  importTopicsCSV,
  importAuthorsCSV
} = require('../controllers/csvImportControllers');

const router = express.Router();

// Read OpenAlex subfields from CSV and import them
router.post('/subfields', importSubfieldsCSV);

// Read OpenAlex topics from CSV and import them 
router.post('/topics', importTopicsCSV);

// Read OpenAlex authors from CSV and import them
router.post('/authors', importAuthorsCSV);

module.exports = router
