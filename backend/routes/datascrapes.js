const express = require('express');
const {
  fetchExperts,
  importExpertsOA
} = require('../controllers/dataScrapeControllers');

const router = express.Router();

//GET experts from API
router.get('/fetch', fetchExperts);

router.post('/authors', importExpertsOA);

module.exports = router
