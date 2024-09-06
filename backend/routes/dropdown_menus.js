const express = require('express');
const {
  getUniqueContinents,
  getUniqueRegions,
  getUniqueSubregions,
  getUniqueCountries,
  getUniqueDomains,
  getUniqueFields,
  getUniqueSubfields,
  getUniqueTopics
} = require('../controllers/dropdownControllers');

const router = express.Router();

// GET unique institutions
// Not in use bc Institutions uses text box input now
// router.get('/institutions', getUniqueInstitutions);

// GET unique continents
router.get('/geo/continents', getUniqueContinents);

// GET unique regions based on selected continent
router.get('/geo/regions', getUniqueRegions);

// GET unique subregions based on selected continent
router.get('/geo/subregions', getUniqueSubregions);

// GET unique countries based on selected region OR subregion if applicable
router.get('/geo/countries', getUniqueCountries);

// GET unique domains
router.get('/study/domains', getUniqueDomains);

// GET unique fields based on domain
router.get('/study/fields', getUniqueFields);

// GET unique subfields based on fields
router.get('/study/subfields', getUniqueSubfields);

// GET unique topics based on subfields
router.get('/study/topics', getUniqueTopics);

module.exports = router
