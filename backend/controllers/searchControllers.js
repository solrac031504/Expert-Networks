// import DB models
const Expert = require('../models/Expert');

const Author = require('../models/Author');
const AuthorTopic = require('../models/AuthorTopic');
const Continent = require('../models/Continent');
const Country = require('../models/Country');
const Domain = require('../models/Domain');
const Field = require('../models/Field');
const Institution = require('../models/Institution');
const Region = require('../models/Region');
const Subfield = require('../models/Subfield');
const Subregion = require('../models/Subregion');
const Topic = require('../models/Topic');

const { Sequelize, Op, QueryTypes } = require('sequelize');
const path = require('path');
const fs = require('fs');

const axios = require('axios'); //Import axios for http requests
const { query } = require('express');
const sequelize = require('../database');

require('dotenv').config(); //Import dotenv for environment variables

const fetchExperts = async(queryParams) => {
  const { field_of_study, raw_institution, region, sorting_sequence } = queryParams;

  if (!field_of_study && !raw_institution && !region) {
    return [];
  }
  
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
  // For multiple institutions:
  // Chaining everything with OR should work
  if (raw_institution && raw_institution !== 'All') {
    // Split the institution input
    const institutionArr = raw_institution.split(',');
    // Push the OR conditions in here one institution at a time
    let finalLikeChain = [];

    for (const institution of institutionArr) {
      finalLikeChain.push({
        [Op.or]: [
          { '$Institution.name$': { [Op.like]: `%${institution}%` } },
          { '$Institution.acronym$': { [Op.like]: `%${institution}%` } },
          { '$Institution.alias$': { [Op.like]: `%${institution}%` } },
          { '$Institution.label$': { [Op.like]: `%${institution}%` } }
        ]
      });
    }

    query[Op.or] = finalLikeChain;
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

    // [name, value] pairSort[1] is value. If null, skip to avoid error
    if (!pairSort[1]) continue;
    // console.log(`Pair: ${pairSort}`);

    order_query.push(pairSort);
  }

  console.log(query);
  console.log(order_query);

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

  return results;
};

const pairSearch = async() => {
  const results = await Author.findAll({
    attributes: [
      ['display_name', 'author_name']
    ],
    include: [
      {
        model: Topic,
        attributes: [['display_name', 'topic_name']],
        through: { attributes: [] },
        required: true
      }
    ],
    limit: 10
  });
  return results;
};

const testSearch = async() => {
  const results = await Author.findAll({
    attributes: [
      [Sequelize.fn('DISTINCT', Sequelize.col('Author.display_name')), 'author_name'],
      [Sequelize.col('Institution.name'), 'institution_name'],
      [Sequelize.col('Institution->Country.name'), 'country_name'],
      'works_count',
      'cited_by_count',
      'hindex',
      'i_ten_index',
      'impact_factor',
    ],
    include: [
      {
        model: Institution,
        attributes: [],
        required: true,
        include: [
          {
            model: Country,
            attributes: [],
            required: true,
            include: [
              {
                model: Subregion,
                attributes: [],
                required: false
              },
              {
                model: Region,
                attributes: [],
                required: true,
                include: [
                  {
                    model: Continent,
                    attributes: [],
                    required: true
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        model: Topic,
        attributes: [],
        through: {
          attributes: [] // Don't select the values from AuthorTopics
        },
        required: true,
        include: [
          {
            model: Subfield,
            attributes: [],
            required: true,
            include: [
              {
                model: Field,
                attributes: [],
                required: true,
                include: [
                  {
                    model: Domain,
                    attributes: [],
                    required: true
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    limit: 10,
    raw: true
  });

  return results;
};

// search experts with query parameters
const searchExperts = async (req, res) => {
  try {
    // const results = await fetchExperts(req.query);

    const test = await testSearch();
    // const pairs = await pairSearch();
    // console.log(test);
    // const results = await Expert.findAll();
    res.status(200).json(test);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  searchExperts,
  fetchExperts
};
