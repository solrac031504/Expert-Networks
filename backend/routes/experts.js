const express = require('express')
const {
  getExperts, 
  getExpert, 
  createExpert, 
  deleteExpert, 
  updateExpert
} = require('../controllers/expertController')

const router = express.Router()

// GET all experts
router.get('/', getExperts)

// GET a single expert
router.get('/:id', getExpert)

// POST a new expert
router.post('/', createExpert)

// DELETE a expert
router.delete('/:id', deleteExpert)

// UPDATE a expert
router.patch('/:id', updateExpert)

module.exports = router