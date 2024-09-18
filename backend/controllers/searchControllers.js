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

const arrToWhere = async(where_arr, institution_arr) => {
  if (where_arr.length === 0 && institution_arr.length === 0) return ''

  let result = 'WHERE';

  for (let i = 0; i < where_arr.length; i++) {
    result = result.concat(' ', where_arr[i]);

    // Append an AND if there are remaining values in the first array OR if there are values in the institution_arr
    if (i + 1 < where_arr.length || institution_arr.length !== 0) result = result.concat(' ', 'AND');
  }

  if (institution_arr.length !== 0) {
    result = result.concat(' ', '(');

    for (let i = 0; i < institution_arr.length; i++) {
      conditions = `LOWER(Institutions.name) LIKE '%${institution_arr[i]}%' OR
                    LOWER(Institutions.acronym) LIKE '%${institution_arr[i]}%' OR
                    LOWER(Institutions.alias) LIKE '%${institution_arr[i]}%' OR
                    LOWER(Institutions.label) LIKE '%${institution_arr[i]}%'`;

      result = result.concat(conditions);

      if (i + 1 < institution_arr.length) result = result.concat(' ', 'OR', ' ')
    }

    result = result.concat(')');
  }

  return result;
};

const oldSearch = async(queryParams) => {
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

const fetchExperts = async(queryParams) => {
  // Get the query parameters
  // These are id
  const {
    domain,
    field,
    subfield,
    topic,
    continent,
    region,
    subregion,
    country,
    institution
  } = queryParams;

  let where_clause;
  let where_arr = [];
  let institutionArr = [];

  if (domain) where_arr.push(`Domains.id=${domain}`);
  if (field) where_arr.push(`Fields.id=${field}`);
  if (subfield) where_arr.push(`Subfields.id=${subfield}`);
  if (topic) where_arr.push(`Topics.id=${topic}`);
  if (continent) where_arr.push(`Continents.id=${continent}`);
  if (region) where_arr.push(`Regions.id=${region}`);
  if (subregion) where_arr.push(`Subregions.id=${subregion}`);
  if (country) where_arr.push(`Countries.id=${country}`);

  if (institution) institutionArr = institution.split(',').map(item => item.trim());

  where_clause = await arrToWhere(where_arr, institutionArr);

  console.log("WHERE CLAUSE:\n", where_clause);

  const results = await sequelize.query(`
    SELECT DISTINCT Authors.display_name AS 'author_name',
                Institutions.name    AS 'institution_name',
                Countries.name       AS 'country_name',
                Authors.works_count,
                Authors.cited_by_count,
                Authors.hindex,
                Authors.i_ten_index,
                Authors.impact_factor
    FROM   Authors
          INNER JOIN Institutions
                  ON Authors.last_known_institution_id =
                      Institutions.institution_id
          INNER JOIN Countries
                  ON Institutions.country_code = Countries.alpha2
          LEFT JOIN Subregions
                  ON Countries.subregion_id = Subregions.id
          INNER JOIN Regions
                  ON Countries.region_id = Regions.id
          INNER JOIN Continents
                  ON Regions.continent_id = Continents.id
          INNER JOIN AuthorTopics
                  ON Authors.id = AuthorTopics.author_id
          INNER JOIN Topics
                  ON AuthorTopics.topic_id = Topics.id
          INNER JOIN Subfields
                  ON Topics.subfield_id = Subfields.id
          INNER JOIN Fields
                  ON Subfields.field_id = Fields.id
          INNER JOIN Domains
                  ON Fields.domain_id = Domains.id
    ${where_clause}
    LIMIT 15`,
    { type: QueryTypes.SELECT }
  );

  return results;
};

// search experts with query parameters
const searchExperts = async (req, res) => {
  try {
    const results = await fetchExperts(req.query);
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  searchExperts,
  fetchExperts
};
