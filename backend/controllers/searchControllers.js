// import DB models
const Expert = require('../models/Expert');
const Institution = require('../models/Institution');

const { Sequelize, Op, QueryTypes } = require('sequelize');
const path = require('path');
const fs = require('fs');

const axios = require('axios'); //Import axios for http requests
const { query } = require('express');
const sequelize = require('../database');

require('dotenv').config(); //Import dotenv for environment variables

// search experts with query parameters
const searchExperts = async (req, res) => {
  const { field_of_study, institution, region } = req.query;
  
  // Applied to the WHERE clause of the SQL Query
  // If the var is not null AND it is not All, then the request is comma
  // delimited and added to the WHERE clause
  // The $$ allows selection of columns in a separate table since 
  // the main query selects from Experts
  let query = {};
  if (field_of_study && field_of_study !== 'All') query.field_of_study = {
    [Op.in]: field_of_study.split(',')
  };

  if (institution && institution !== 'All') query['$Institution.name$'] = {
    [Op.in]: institution.split(',')
  };

  if (region && region !== 'All') query['$Institution.country$'] = {
    [Op.in]: region.split(',')
  };

  try {
    const results = await Expert.findAll({
        attributes: [
            'name',
            'field_of_study',
            [Sequelize.col('Institution.name'), 'institution'],
            [Sequelize.col('Institution.country'), 'region'],
            'citations',
            'hindex',
            'i_ten_index',
            'impact_factor',
            'age',
            'years_in_field',
            'email'
        ],
        include: [{
            model: Institution,
            attributes: [], // No need to include Institution attributes as they are already selected above
            required: false, // This makes it a LEFT JOIN
          }],
        where: query,
    });

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  searchExperts
};
