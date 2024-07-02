// import DB models
const Institution = require('../models/Institution');

const path = require('path');
const fs = require('fs');

const axios = require('axios'); //Import axios for http requests
const { query } = require('express');

require('dotenv').config(); //Import dotenv for environment variables

// get all experts
const getInstitutions = async (req, res) => {
  const institutions = await Institution.findAll();

  res.status(200).json(institutions);
}

/*
// get a single expert
const getExpert = async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({error: 'No such expert'})
  }

  const expert = await Expert.findById(id)

  if (!expert) {
    return res.status(404).json({error: 'No such expert'})
  }

  res.status(200).json(expert)
}
*/

// create a new expert
const createInstitution = async (req, res) => {
  // add to the database
  try {
    const institution = req.body;
    await Institution.create(institution);
    res.status(200).json(institution)
  } 
  catch (error) {
    res.status(400).json({ error: error.message })
  }
}

/*
// delete an expert
const deleteExpert = async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({error: 'No such expert'})
  }

  const expert = await Expert.findOneAndDelete({_id: id})

  if(!expert) {
    return res.status(400).json({error: 'No such expert'})
  }

  res.status(200).json(expert)
}
*/

/*
// update an expert
const updateExpert = async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({error: 'No such expert'})
  }

  const expert = await Expert.findOneAndUpdate({author_id: author_id}, {
    ...req.body
  })

  if (!expert) {
    return res.status(400).json({error: 'No such expert'})
  }

  res.status(200).json(expert)
}
*/

module.exports = {
  getInstitutions,
  createInstitution
};
