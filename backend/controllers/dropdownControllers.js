const Expert = require('../models/Expert');
const Institution = require('../models/Institution');
const { QueryTypes } = require('sequelize');
const sequelize = require('../database');
require('dotenv').config(); // Import dotenv for environment variables

// get unique fields of study
const getUniqueFields = async (req, res) => {
  try {
    const fields = await sequelize.query('SELECT DISTINCT field_of_study FROM `Experts` ORDER BY field_of_study ASC', {
      type: QueryTypes.SELECT
    });

    // converts objects to array
    res.status(200).json(fields.map(field => field.field_of_study));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get unique institutions
const getUniqueInstitutions = async (req, res) => {
  try {
    const institutions = await sequelize.query('SELECT DISTINCT name FROM `Institutions` ORDER BY name ASC LIMIT 25', {
      type: QueryTypes.SELECT
    });

    // converts objects to array
    res.status(200).json(institutions.map(institution => institution.name));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get unique regions
const getUniqueRegions = async (req, res) => {
  try {
    const regions = await sequelize.query('SELECT DISTINCT country FROM `Institutions` ORDER BY country ASC', {
      type: QueryTypes.SELECT
    });

    // converts objects to array
    res.status(200).json(regions.map(region => region.country));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getUniqueFields,
  getUniqueInstitutions,
  getUniqueRegions
};
