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
  const { field_of_study, raw_institution, region, citations, hindex, i10, imp_fac, age, years, sorting_sequence } = req.query;

  // Format the institution String for LIKE matching %___%
  let temp = '%';
  institution = temp.concat(raw_institution, '%');
  
  // Applied to the WHERE clause of the SQL Query
  // If the var is not null AND it is not All, then the request is comma
  // delimited and added to the WHERE clause
  // The $$ allows selection of columns in a separate table since 
  // the main query selects from Experts
  let query = {};
  let order_query = [];

  if (field_of_study && field_of_study !== 'Field') query.field_of_study = {
    [Op.in]: field_of_study.split(',')
  };

  // if (institution && institution !== 'All') {
  //   query['$Institution.name$'] = {
  //     [Op.in]: institution.split(',')
  //   };
  // }

  // Uses LIKE operators, but can only do one entry at a time
  // Need to find a better way in this case
  if (raw_institution && raw_institution !== 'All') {
    query[Op.or] = [
      { '$Institution.name$': { [Op.like]: institution } },
      { '$Institution.acronym$': { [Op.like]: institution } },
      { '$Institution.alias$': { [Op.like]: institution } },
      { '$Institution.label$': { [Op.like]: institution } }
    ];
  }

  if (region && region !== 'Region') query['$Institution.country$'] = {
    [Op.in]: region.split(',')
  };

  // build order by
  // if (citations)  order_query.push(['citations', citations]);
  // if (hindex)  order_query.push(['hindex', hindex]);
  // if (i10)  order_query.push(['i_ten_index', i10]);
  // if (imp_fac)  order_query.push(['impact_factor', imp_fac]);
  // if (age)  order_query.push(['age', age]);
  // if (years)  order_query.push(['years_in_field', years]);

  // ',' splits name:value pairs
  const sortingSequenceArray = sorting_sequence ? sorting_sequence.split(',') : [];

  // iterate through the array and split on ':'. Then, construct the order query
  for (var pair of sortingSequenceArray) {
    if (!pair) continue;

    let pairSort = pair.split(':');
    // console.log(`Pair: ${pairSort}`);

    order_query.push(pairSort);
  }

  console.log(query);
  console.log(order_query);

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
        order: order_query
    });

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  searchExperts
};
