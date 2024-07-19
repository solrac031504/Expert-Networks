const express = require('express');
const {
  exportExpertsToCSV,
  exportExpertsToPDF
} = require('../controllers/downloadControllers');

const router = express.Router();

// Convert table to CSV
router.get('/export/csv', exportExpertsToCSV);

// Convert table to PDF
router.get('/export/pdf', exportExpertsToPDF);

module.exports = router;
