// import DB models
const Institution = require('../models/Institution');

const path = require('path');
const fs = require('fs');

const axios = require('axios'); //Import axios for http requests
const { query } = require('express');

require('dotenv').config(); //Import dotenv for environment variables

// get all Institutions
const getInstitutions = async (req, res) => {
  const institutions = await Institution.findAll();

  res.status(200).json(institutions);
}

// get a single Institution
const getInstitution = async (req, res) => {
  const { id } = req.params

  const institution = await Institution.findByPk(id)

  if (institution == null) {
    return res.status(404).json({error: 'No such institution'})
  }

  res.status(200).json(institution);
}

// create a new Institution
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

// delete an Institution
const deleteInstitution = async (req, res) => {
  const { id } = req.params

  const institution = await Institution.destroy({
    where: {
      institution_id: id
    }
  });

  if(institution == null) {
    return res.status(400).json({error: 'No such institution'})
  }

  res.status(200).json(institution)
}

// update an Institution
const updateInstitution = async (req, res) => {
  const { id } = req.params

  const {
    institution_id,
    name,
    country
  } = req.body;

  const institution = await Institution.update(
    {
      institution_id: institution_id,
      name: name,
      country: country
    },
    {
      where: {
        institution_id: id
      }
    }
  );

  if (institution == null) {
    return res.status(400).json({error: 'No such institution'})
  }

  res.status(200).json(institution)
}

module.exports = {
  getInstitutions,
  getInstitution,
  createInstitution,
  deleteInstitution,
  updateInstitution,
};
