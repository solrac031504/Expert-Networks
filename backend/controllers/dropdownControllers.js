const Expert = require('../models/Expert');
const Institution = require('../models/Institution');

const { QueryTypes } = require('sequelize');

const path = require('path');
const fs = require('fs');

const axios = require('axios'); //Import axios for http requests
const { query } = require('express');
const sequelize = require('../database');

require('dotenv').config(); //Import dotenv for environment variables

// get unique fields of study
const getUniqueFields = async (req, res) => {
    try {
      const fields = await sequelize.query('SELECT DISTINCT field_of_study FROM `Experts`', {
        type: QueryTypes.SELECT
      })

      res.status(200).json(fields);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  // get unique institutions
  const getUniqueInstitutions = async (req, res) => {
    try {
      const institutions = await sequelize.query('SELECT DISTINCT name FROM `Institutions`', {
        type: QueryTypes.SELECT
      })
      res.status(200).json(institutions);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  // get unique regions
  const getUniqueRegions = async (req, res) => {
  
    try {
      const regions = await sequelize.query('SELECT DISTINCT country FROM `Institutions`', {
        type: QueryTypes.SELECT
      })
      res.status(200).json(regions);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

module.exports = {
    getUniqueFields,
    getUniqueInstitutions,
    getUniqueRegions
};