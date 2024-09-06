// const Expert = require('../models/Expert');
// const Institution = require('../models/Institution');
const { QueryTypes } = require('sequelize');
const sequelize = require('../database');
require('dotenv').config(); // Import dotenv for environment variables

const Continent = require('../models/Continent');
const Region = require('../models/Region');
const Subregion = require('../models/Subregion');
const Country = require('../models/Country');

const Domain = require('../models/Domain');
const Field = require('../models/Field');
const Subfield = require('../models/Subfield');
const Topic = require('../models/Topic');

// get unique fields of study
// Old function, deprecated
// const getUniqueFields = async (req, res) => {
//   try {
//     const fields = await sequelize.query('SELECT DISTINCT field_of_study FROM `Experts` ORDER BY field_of_study ASC', {
//       type: QueryTypes.SELECT
//     });

//     // converts objects to array
//     res.status(200).json(fields.map(field => field.field_of_study));
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// get unique institutions
// const getUniqueInstitutions = async (req, res) => {
//   try {
//     const institutions = await sequelize.query('SELECT DISTINCT name FROM `Institutions` ORDER BY name ASC LIMIT 25', {
//       type: QueryTypes.SELECT
//     });

//     // converts objects to array
//     res.status(200).json(institutions.map(institution => institution.name));
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// get unique continents
const getUniqueContinents = async (req, res) => {
  try {
    const continents = await Continent.findAll();

    // converts objects to array
    res.status(200).json(continents.map(continent => ({
      id: continent.id,
      name: continent.name
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get unique regions based on the selected continent
const getUniqueRegions = async (req, res) => {
  try {
    const regions = await Region.findAll({
      where: {
        continent_id: req.body.continent_id
      }
    })

    // converts objects to array
    // Return the id and name for later use in the frontend
    // ID / numerical searches is faster
    res.status(200).json(regions.map(region => ({
      id: region.id,
      name: region.name
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get unique subregions based on the selected region
const getUniqueSubregions = async (req,res) => {
  try {
    const subregions = await Subregion.findAll({
      where: {
        region_id: req.body.region_id
      }
    })

    // converts objects to array
    res.status(200).json(subregions.map(subregion => ({
      id: subregion.id,
      name: subregion.name
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get unique countries based on the selected subregion/region
// Not all countries have a subregion
const getUniqueCountries = async (req, res) => {
  try {
    // extract the region_id and the subregion_id
    const { region_id, subregion_id } = req.body;

    // If subregion_id is NULL (i.e., no selection), use the region_id
    // Else, use subregion_id
    let countries;
    if (!subregion_id) {
      countries = await Country.findAll({
        where: {
          region_id: region_id
        }
      })
    } else {
      countries = await Country.findAll({
        where: {
          subregion_id: subregion_id
        }
      })
    }

    // converts objects to array
    res.status(200).json(countries.map(country => ({
      id: country.id,
      name: country.name
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get the domains
const getUniqueDomains = async (req, res) => {
  try {
    const domains = await Domain.findAll();

    // converts objects to array
    res.status(200).json(domains.map(domain => ({
      id: domain.id,
      name: domain.display_name
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get the fields based on domain
const getUniqueFields = async (req, res) => {
  try {
    const fields = await Field.findAll({
      where: {
        domain_id: req.body.domain_id
      }
    })
  
    // converts objects to array
    // Return the id and name for later use in the frontend
    // ID / numerical searches is faster
    res.status(200).json(fields.map(field => ({
      id: field.id,
      name: field.display_name
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get the subfield based on field
const getUniqueSubfields = async (req, res) => {
  try {
    const subfields = await Subfield.findAll({
      where: {
        field_id: req.body.field_id
      }
    })
  
    // converts objects to array
    // Return the id and name for later use in the frontend
    // ID / numerical searches is faster
    res.status(200).json(subfields.map(subfield => ({
      id: subfield.id,
      name: subfield.display_name
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get the topic based on the subfield
const getUniqueTopics = async (req, res) => {
  try {
    const topics = await Topic.findAll({
      where: {
        subfield_id: req.body.subfield_id
      }
    })
  
    // converts objects to array
    // Return the id and name for later use in the frontend
    // ID / numerical searches is faster
    res.status(200).json(topics.map(topic => ({
      id: topic.id,
      name: topic.display_name
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getUniqueContinents,
  getUniqueRegions,
  getUniqueSubregions,
  getUniqueCountries,
  getUniqueDomains,
  getUniqueFields,
  getUniqueSubfields,
  getUniqueTopics
};
