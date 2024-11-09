const express = require('express');
const {
  searchExperts, 
} = require('../controllers/searchControllers');

const router = express.Router();

// GET search experts
router.get('/', searchExperts);

// Keep-alive route to prevent timeout
router.get('/keep-alive', (req, res) => {
  res.sendStatus(200);
});

module.exports = router
