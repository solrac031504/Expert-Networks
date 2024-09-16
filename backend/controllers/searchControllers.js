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

  let query = {};

  // Create the queries for the different joins
  // Narrows down the table at each join
  if (domain) query['Domain.id'] = { [Op.eq]: parseInt(domain) };
  if (field) query['Field.id'] = { [Op.eq]: parseInt(field) };
  if (subfield) query['Subfield.id'] = { [Op.eq]: parseInt(subfield) };
  if (topic) query['Topic.id'] = { [Op.eq]: parseInt(topic) };
  if (continent) query['$Institution.Country.Region.Continent.id$'] = { [Op.eq]: parseInt(continent) };
  if (region) query['Institution.Country.Region.id'] = { [Op.eq]: parseInt(region) };
  if (subregion) query['Institution.Country.Subregion.id'] = { [Op.eq]: parseInt(subregion) };
  if (country) query['Institution.Country.id'] = { [Op.eq]: parseInt(country) };


  if (institution) {
    // Split the institution input
    const institutionArr = raw_institution.split(',');
    // Push the OR conditions in here one institution at a time
    let finalLikeChain = [];

    for (const record of institutionArr) {
      finalLikeChain.push({
        [Op.or]: [
          { '$Institution.name$': { [Op.like]: `%${record}%` } },
          { '$Institution.acronym$': { [Op.like]: `%${record}%` } },
          { '$Institution.alias$': { [Op.like]: `%${record}%` } },
          { '$Institution.label$': { [Op.like]: `%${record}%` } }
        ]
      });
    }

    query[Op.or] = finalLikeChain;
  }

  console.log(query);

  const results = await Author.findAll({
    attributes: [
      'display_name',
      'works_count',
      'works_count_2yr',
      'cited_by_count',
      'cited_by_count_2yr',
      'hindex',
      'hindex_2yr',
      'i_ten_index',
      'i_ten_index_2yr',
      'impact_factor',
    ],
    include: [
      {
        model: Topic,
        include: [
          {
            model: Subfield,
            include: [
              {
                model: Field,
                include: [
                  {
                    model: Domain,
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        model: Institution,
        include: [
          {
            model: Country,
            include: [
              {
                model: Subregion,
              },
              {
                model: Region,
                include: [
                  {
                    model: Continent,
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    where: query,
    limit: 10
  });

  return results;
};

const testSearch = async(queryParams) => {
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

  let query = {};

  // Create the queries for the different joins
  // Narrows down the table at each join
  if (domain) query['Domain.id'] = { [Op.eq]: parseInt(domain) };
  if (field) query['Field.id'] = { [Op.eq]: parseInt(field) };
  if (subfield) query['Subfield.id'] = { [Op.eq]: parseInt(subfield) };
  if (topic) query['Topic.id'] = { [Op.eq]: parseInt(topic) };
  if (continent) query['$Author.Institution.Country.Region.Continent.id$'] = { [Op.eq]: parseInt(continent) };
  if (region) query['Institution.Country.Region.id'] = { [Op.eq]: parseInt(region) };
  if (subregion) query['Institution.Country.Subregion.id'] = { [Op.eq]: parseInt(subregion) };
  if (country) query['Institution.Country.id'] = { [Op.eq]: parseInt(country) };


  if (institution) {
    // Split the institution input
    const institutionArr = raw_institution.split(',');
    // Push the OR conditions in here one institution at a time
    let finalLikeChain = [];

    for (const record of institutionArr) {
      finalLikeChain.push({
        [Op.or]: [
          { '$Institution.name$': { [Op.like]: `%${record}%` } },
          { '$Institution.acronym$': { [Op.like]: `%${record}%` } },
          { '$Institution.alias$': { [Op.like]: `%${record}%` } },
          { '$Institution.label$': { [Op.like]: `%${record}%` } }
        ]
      });
    }

    query[Op.or] = finalLikeChain;
  }

  console.log(query);

  const results = await AuthorTopic.findAll({
    distinct: true,
    attributes: ['author_id'],
    include: [
      {
        model: Author,
        include: [
          {
            model: Institution,
            include: [
              {
                model: Country,
                include: [
                  {
                    model: Subregion,
                  },
                  {
                    model: Region,
                    include: [
                      {
                        model: Continent,
                        attributes: [],
                      }
                    ]
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
        include: [
          {
            model: Subfield,
            attributes: [],
            include: [
              {
                model: Field,
                attributes: [],
                include: [
                  {
                    model: Domain,
                    attributes: []
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    where: query,
    limit: 15
  });

  return results;
};

const rawSearch = async(queryParams) => {
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

  let query = {};

  // Create the queries for the different joins
  // Narrows down the table at each join
  if (domain) query['Domain.id'] = { [Op.eq]: parseInt(domain) };
  if (field) query['Field.id'] = { [Op.eq]: parseInt(field) };
  if (subfield) query['Subfield.id'] = { [Op.eq]: parseInt(subfield) };
  if (topic) query['Topic.id'] = { [Op.eq]: parseInt(topic) };
  if (continent) query['$Author.Institution.Country.Region.Continent.id$'] = { [Op.eq]: parseInt(continent) };
  if (region) query['Institution.Country.Region.id'] = { [Op.eq]: parseInt(region) };
  if (subregion) query['Institution.Country.Subregion.id'] = { [Op.eq]: parseInt(subregion) };
  if (country) query['Institution.Country.id'] = { [Op.eq]: parseInt(country) };


  if (institution) {
    // Split the institution input
    const institutionArr = raw_institution.split(',');
    // Push the OR conditions in here one institution at a time
    let finalLikeChain = [];

    for (const record of institutionArr) {
      finalLikeChain.push({
        [Op.or]: [
          { '$Institution.name$': { [Op.like]: `%${record}%` } },
          { '$Institution.acronym$': { [Op.like]: `%${record}%` } },
          { '$Institution.alias$': { [Op.like]: `%${record}%` } },
          { '$Institution.label$': { [Op.like]: `%${record}%` } }
        ]
      });
    }

    query[Op.or] = finalLikeChain;
  }

  console.log(query);

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
    LIMIT 15`,
    { type: QueryTypes.SELECT }
  );

  return results;
};

// search experts with query parameters
const searchExperts = async (req, res) => {
  // console.log("Author associations", Author.associations);
  // console.log("AuthorTopic associations", AuthorTopic.associations);
  // console.log("Topic associations", Topic.associations);
  // console.log("Subfield associations", Subfield.associations);
  // console.log("Field associations", Field.associations);
  // console.log("Domain associations", Domain.associations);
  // console.log("Institution associations", Institution.associations);
  // console.log("Country associations", Country.associations);
  // console.log("Region associations", Region.associations);
  // console.log("Continent associations", Continent.associations);


  try {
    // const results = await testSearch(req.query);
    // const results = await fetchExperts(req.query);
    const results = await rawSearch(req.query);
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  searchExperts,
  fetchExperts
};
