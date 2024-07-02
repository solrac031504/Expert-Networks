const express = require('express');
const {
  getInstitutions,
  getInstitution,
  createInstitution,
  deleteInstitution,
  updateInstitution
} = require('../controllers/institutionControllers');

const router = express.Router();

// GET a single institution
router.get('/:id', getInstitution);

// GET all institutions
router.get('/', getInstitutions);

// POST a new expert
router.post('/', createInstitution);

// DELETE an institution
router.delete('/:id', deleteInstitution);

// UPDATE an institution
router.patch('/:id', updateInstitution);

module.exports = router
