const express = require('express');
const {
  importInstitutionsCSV
} = require('../controllers/institutionsImportControllers');

const router = express.Router();

// Import Institutions from CSV
router.post('/', importInstitutionsCSV);

module.exports = router
