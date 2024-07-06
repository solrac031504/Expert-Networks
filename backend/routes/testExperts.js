const express = require('express');
const {
  getTestExperts,
  getTestExpert,
  createTestExpert,
  deleteTestExpert,
  updateTestExpert
} = require('../controllers/testExpertControllers');

const router = express.Router();

// Convert table to CSV
// router.get('/export/csv', exportExpertsToCSV);

// GET unique fields
// router.get('/fields', getUniqueFields);

// GET unique institutions
// router.get('/institutions', getUniqueInstitutions);

// GET unique regions
// router.get('/regions', getUniqueRegions);

// GET search experts
// router.get('/search', searchExperts);

//GET experts from API
// router.get('/fetch', fetchExperts);

// GET a single expert
router.get('/:id', getTestExpert);

// GET all experts
router.get('/', getTestExperts);

// POST a new expert
router.post('/', createTestExpert);

// DELETE an expert
router.delete('/:id', deleteTestExpert)

// UPDATE a expert
router.patch('/:id', updateTestExpert)

module.exports = router
