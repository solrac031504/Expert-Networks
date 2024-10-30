const express = require('express');

const {
  searchAll, 
} = require('../controllers/naturalLanguageController');

const router = express.Router();

// GET search all entities
router.get('/', searchExperts);

module.exports = router