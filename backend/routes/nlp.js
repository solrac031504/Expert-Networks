const express = require('express');
const router = express.Router();
const nlpController = require('../controllers/nlpController');

// Define the route for text classification
router.post('/classify', nlpController.classifyText);

module.exports = router;
