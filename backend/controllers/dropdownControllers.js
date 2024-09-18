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

// get unique continents
const getUniqueContinents = async (req, res) => {
  try {
    const continents = await Continent.findAll({
      order: [
        ['name', 'ASC']
      ]
    });

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
        continent_id: req.query.continent_id
      },
      order: [
        ['name', 'ASC']
      ]
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
        region_id: req.query.region_id
      },
      order: [
        ['name', 'ASC']
      ]
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
    const { region_id, subregion_id } = req.query;

    // If subregion_id is NULL (i.e., no selection) or undefined, use the region_id
    // Else, use subregion_id
    let countries;
    if (!subregion_id || subregion_id==='undefined') {
      countries = await Country.findAll({
        where: {
          region_id: region_id
        },
        order: [
          ['name', 'ASC']
        ]
      })
    } else {
      countries = await Country.findAll({
        where: {
          subregion_id: subregion_id
        },
        order: [
          ['name', 'ASC']
        ]
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
    const domains = await Domain.findAll({
      order: [
        ['display_name', 'ASC']
      ]
    });

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
        domain_id: req.query.domain_id
      },
      order: [
        ['display_name', 'ASC']
      ]
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
        field_id: req.query.field_id
      },
      order: [
        ['display_name', 'ASC']
      ]
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
        subfield_id: req.query.subfield_id
      },
      order: [
        ['display_name', 'ASC']
      ]
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
