const express = require('express');
const {
  exportExpertsToCSV,
  exportExpertsToPDF,
  exportExpertsToXLS,
  exportExpertsToWord
} = require('../controllers/downloadControllers');

const router = express.Router();

// Convert table to CSV
router.get('/export/csv', exportExpertsToCSV);

// Convert table to PDF
router.get('/export/pdf', exportExpertsToPDF);

// Convert table to XLS
router.get('/export/xls', exportExpertsToXLS);

// Convert table to Word
router.get('/export/word', exportExpertsToWord)

module.exports = router;
