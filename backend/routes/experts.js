const express = require('express');
const {
  getExperts,
  getExpert,
  createExpert,
  deleteExpert,
  updateExpert,
  getUniqueFields,
  getUniqueInstitutions,
  getUniqueRegions,
  searchExperts
} = require('../controllers/expertController');

const router = express.Router();

// GET unique fields
router.get('/fields', getUniqueFields);

// GET unique institutions
router.get('/institutions', getUniqueInstitutions);

// GET unique regions
router.get('/regions', getUniqueRegions);

// GET search experts
router.get('/search', searchExperts);

// DELETE an expert
router.delete('/:id', deleteExpert);

// UPDATE an expert
router.patch('/:id', updateExpert);

// GET a single expert
router.get('/:id', getExpert);

// GET all experts
router.get('/', getExperts);

// POST a new expert
router.post('/', createExpert);

module.exports = router;
