const express = require('express');
const {
  exportExpertsToCSV,
  exportExpertsToPDF,
  exportExpertsToXLS
} = require('../controllers/downloadControllers');

const router = express.Router();

// Convert table to CSV
router.get('/export/csv', exportExpertsToCSV);

// Convert table to PDF
router.get('/export/pdf', exportExpertsToPDF);

// Convert table to XLS
router.get('/export/xls', exportExpertsToXLS);

module.exports = router;
