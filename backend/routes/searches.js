const express = require('express');
const {
  searchExperts, 
} = require('../controllers/searchControllers');

const router = express.Router();

// GET search experts
router.get('/', searchExperts);

module.exports = router
