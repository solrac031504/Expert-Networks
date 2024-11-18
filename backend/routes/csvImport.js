const express = require('express');
const {
  importSubfieldsCSV,
  importTopicsCSV,
  importAuthorsCSV,
  importAuthorTopicsCSV,
  importInstitutionsCSV
} = require('../controllers/csvImportControllers');

const router = express.Router();

// Read OpenAlex subfields from CSV and import them
router.post('/subfields', importSubfieldsCSV);

// Read OpenAlex topics from CSV and import them 
router.post('/topics', importTopicsCSV);

// Read OpenAlex authors from CSV and import them
router.post('/authors', importAuthorsCSV);

// Read OpenAlex author topics from CSV and import them
router.post('/author-topics', importAuthorTopicsCSV);

// Read ROR institutions from CSV and import them
router.post('/institutions', importInstitutionsCSV);

module.exports = router
