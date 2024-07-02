const express = require('express');
const {
  getInstitutions,
  // getExpert,
  createInstitution,
  // deleteExpert,
  // updateExpert,
  // getUniqueFields,
  // getUniqueInstitutions,
  // getUniqueRegions,
  // searchExperts, 
  // fetchExperts,
  // exportExpertsToCSV
} = require('../controllers/institutionControllers');

const router = express.Router();

// GET a single institution
// router.get('/:id', getInstitution);

// GET all institutions
router.get('/', getInstitutions);

// POST a new expert
router.post('/', createInstitution);

// DELETE an institution
// router.delete('/:id', deleteExpert)

// UPDATE an institution
// router.patch('/:id', updateExpert)

module.exports = router
