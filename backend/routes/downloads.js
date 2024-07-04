const express = require('express');
const {
  exportExpertsToCSV
} = require('../controllers/downloadControllers');

const router = express.Router();

// Convert table to CSV
router.get('/export/csv', exportExpertsToCSV);

module.exports = router
