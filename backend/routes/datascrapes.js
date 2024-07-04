const express = require('express');
const {
  fetchExperts,
} = require('../controllers/dataScrapeControllers');

const router = express.Router();

//GET experts from API
router.get('/fetch', fetchExperts);

module.exports = router
