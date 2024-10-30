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

// Search all types of entities (authors, institutions, topics) using a single query
const searchAll = async (req, res) => {
    const { query } = req.query;
  
    if (!query || query.trim() === "") {
      return res.status(400).json({ error: "Query parameter is required." });
    }
  
    try {
      const results = await sequelize.query(
        `(
          SELECT 
            'institution' AS type, 
            Authors.id, 
            Authors.display_name, 
            Authors.last_known_institution_id, 
            Institutions.name AS institution_name, 
            Authors.works_count, 
            Authors.cited_by_count,
            Authors.hindex,
            Authors.i_ten_index,
            Authors.impact_factor,
            NULL AS topic_name
          FROM 
            Authors 
          JOIN 
            Institutions 
          ON 
            Authors.last_known_institution_id = Institutions.institution_id 
          WHERE 
            MATCH(Institutions.name) AGAINST(:searchTerm IN NATURAL LANGUAGE MODE)
          LIMIT 100
        )
        UNION
        (
          SELECT 
            'author' AS type, 
            Authors.id, 
            Authors.display_name, 
            NULL AS last_known_institution_id, 
            NULL AS institution_name, 
            Authors.works_count, 
            Authors.cited_by_count, 
            Authors.hindex, 
            Authors.i_ten_index, 
            Authors.impact_factor, 
            NULL AS topic_name
          FROM 
            Authors
          WHERE 
            MATCH(display_name) AGAINST(:searchTerm IN NATURAL LANGUAGE MODE)
          LIMIT 100
        )
        UNION
        (
          SELECT 
            'topic' AS type, 
            Authors.id, 
            Authors.display_name, 
            Authors.last_known_institution_id, 
            Institutions.name AS institution_name, 
            Authors.works_count, 
            Authors.cited_by_count,
            Authors.hindex,
            Authors.i_ten_index,
            Authors.impact_factor,
            Topics.display_name AS topic_name
          FROM 
            Authors 
          JOIN 
            AuthorTopics 
          ON 
            Authors.id = AuthorTopics.author_id
          JOIN 
            Topics 
          ON 
            AuthorTopics.topic_id = Topics.id
          JOIN 
            Institutions 
          ON 
            Authors.last_known_institution_id = Institutions.institution_id
          WHERE 
            MATCH(Topics.display_name) AGAINST(:searchTerm IN NATURAL LANGUAGE MODE)
          LIMIT 100
        );`,
        {
          replacements: { searchTerm: query },
          type: QueryTypes.SELECT,
        }
      );
  
      res.status(200).json(results);
    } catch (error) {
      console.error("Error executing search:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  
  module.exports = {
    searchAll,
  };