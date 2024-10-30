// Import express
const express = require('express');

// Import the controller method
const { searchAll } = require('../controllers/naturalLanguageController');

const router = express.Router();

// GET search all entities
router.get('/', searchAll);

module.exports = router;
