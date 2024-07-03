const express = require('express');
const {
  getUniqueFields,
  getUniqueInstitutions,
  getUniqueRegions,
} = require('../controllers/dropdownControllers');

const router = express.Router();

// GET unique fields
router.get('/fields', getUniqueFields);

// GET unique institutions
router.get('/institutions', getUniqueInstitutions);

// GET unique regions
router.get('/regions', getUniqueRegions);

module.exports = router
