const express = require('express');
const {
  importTopicsCSV,
} = require('../controllers/csvImportControllers');

const router = express.Router();

// Read OpenAlex topics from CSV and import them
router.post('/post', importTopicsCSV);

module.exports = router
