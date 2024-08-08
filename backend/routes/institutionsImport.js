const express = require('express');
const {
  importInstitutionsCSV,
  createInstitutionsCSV,
  updateInstitutionsCSV
} = require('../controllers/institutionsImportControllers');

const router = express.Router();

// Import all Institutions from CSV
router.get('/', importInstitutionsCSV);
router.post('/create', createInstitutionsCSV);
router.patch('/update', updateInstitutionsCSV);

module.exports = router
