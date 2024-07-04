// import DB models
const Expert = require('../models/Expert');
const Institution = require('../models/Institution');

const { Sequelize, Op, QueryTypes } = require('sequelize');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
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
    /*
    const results = await sequelize.query(
        'SELECT Experts.name, Experts.field_of_study, Institutions.name, Institutions.country, Experts.citations, Experts.hindex, Experts.i_ten_index, Experts.impact_factor, Experts.age, Experts.years_in_field, Experts.email FROM Experts LEFT JOIN Institutions ON Experts.institution_id=Institutions.institution_id WHERE Experts.field_of_study IN (:field_of_study) AND Institutions.name IN (:institution) AND Institutions.country IN (:region)', {
            replacements: {
                field_of_study: query.field_of_study,
                institution: query.institution,
                region: query.region
            },
            type: QueryTypes.SELECT
        }); */

    const results = await Expert.findAll({
        attributes: [
            ['name', 'Name'],
            ['field_of_study', 'Field of Study'],
            [Sequelize.col('Institution.name'), 'Current Institution'],
            [Sequelize.col('Institution.country'), 'Country'],
            ['citations', 'Times Cited'],
            ['hindex', 'H-Index'],
            ['i_ten_index', 'I10-Index'],
            ['impact_factor', 'Impact Factor'],
            ['age', 'Age'],
            ['years_in_field', 'Years in Field'],
            ['email', 'Email']
        ],
        include: [{
            model: Institution,
            attributes: [], // No need to include Institution attributes as they are already selected above
            required: false, // This makes it a LEFT JOIN
          }],
        where: query,
        logging: console.log
    });

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  searchExperts
};
