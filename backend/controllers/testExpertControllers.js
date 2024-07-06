// import DB models
const TestExpert = require('../models/TestExpert');

const path = require('path');
const fs = require('fs');

const axios = require('axios'); //Import axios for http requests
const { query } = require('express');

require('dotenv').config(); //Import dotenv for environment variables

// get all experts
const getTestExperts = async (req, res) => {
  const experts = await TestExpert.findAll();

  res.status(200).json(experts);
}

// get a single expert
const getTestExpert = async (req, res) => {
  const { id } = req.params

  const expert = await TestExpert.findByPk(id)

  if (expert == null) {
    return res.status(404).json({error: 'No such expert'})
  }

  res.status(200).json(expert)
}

// create a new expert
const createTestExpert = async (req, res) => {
  // add to the database
  try {
    const expert = req.body;
    await TestExpert.create(expert);
    res.status(200).json(expert)
  } 
  catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// delete an expert
const deleteTestExpert = async (req, res) => {
  const { id } = req.params

  const expert = await TestExpert.destroy({
    where: {
      expert_id: id
    }
  });

  if(expert == null) {
    return res.status(400).json({error: 'No such expert'})
  }

  res.status(200).json(expert)
}

// update an expert
const updateTestExpert = async (req, res) => {
  const { id } = req.params

  const {
    expert_id,
    name,
    field_of_study,
    institution,
    region,
    citations,
    hindex,
    i_ten_index,
    impact_factor,
    age,
    years_in_field,
    email
  } = req.body;

  const expert = await TestExpert.update(
    {
      expert_id: expert_id,
      name: name,
      field_of_study: field_of_study,
      institution: institution,
      region: region,
      citations: citations,
      hindex: hindex,
      i_ten_index: i_ten_index,
      impact_factor: impact_factor,
      age: age,
      years_in_field: years_in_field,
      email: email
    },
    {
      where: {
        expert_id: id
      }
    }
  );

  if (expert == null) {
    return res.status(400).json({error: 'No such expert'})
  }

  res.status(200).json(expert)
}

module.exports = {
  getTestExperts,
  getTestExpert,
  createTestExpert,
  deleteTestExpert,
  updateTestExpert
};
