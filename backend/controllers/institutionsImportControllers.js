// import DB models
const Institution = require('../models/Institution');

const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');


const axios = require('axios'); //Import axios for http requests
const { query } = require('express');
const sequelize = require('../database');

require('dotenv').config(); //Import dotenv for environment variables

// Updates all institution records in the database
// NOTE: Requires minmal data cleaning, but is very slow
const importInstitutionsCSV = async (req, res) => {
  const ifp = path.resolve('allInstitutions.csv');
  // const ifp = path.resolve('testImport.csv');

  // Stores CSV data
  const institutions = [];

  // Read CSV
  fs.createReadStream(ifp)
  .pipe(csv())
  .on('data', (row) => {
    // Skip header row
    if (row['institution_id'] !== 'id') {
      institutions.push({
        institution_id: row.id, // institution_id
        name: row.ror_display, // name
        acronym: row.acronym, // name acronym
        alias: row.alias, // name alias
        label: row.label, // name label
        country_code: row.country_code, // alpha2 code
        status: row.status, // status
        types: row.types, // type of institution
        createdAt: row.created, // date created
        updatedAt: row.last_modified // data modified
      });
    }
  })
  .on('end', async () => {
    try {
      // Use bulkCreate and updateOnDuplicate to improve import times
      // Increments of 1000
      for (let i = 0; i < institutions.length; i += 1000) {
        // Lower bound is the current i value, increments of 1000
        let lowerBound = i;
        // Upper bound is 
        let upperBound = (i+1000 > institutions.length) ? institutions.length : i + 1000

        let records = institutions.slice(lowerBound, upperBound);
        await Institution.bulkCreate(records, {
          updateOnDuplicate: ['name', 'acronym', 'alias', 'label', 'country_code', 'status', 'types', 'createdAt', 'updatedAt']
        });
      }

      console.log('Institutions successfully imported');
      res.status(200).json(institutions[0]);

    } catch(error) {
      console.error('Error importing institutions:', error);
      res.status(500).json({ error: error.message});
    }
  });
}

// Creates all of the institutions in the createInstitutions csv file
// NOTE: Assumes that all of the institutions in the csv file do not already exist in the database
// Either use the update notes to split the data or sort the data and separate the most recently updated institutions
const createInstitutionsCSV = async (req, res) => {
  const ifp = path.resolve('createInstitutions.csv');
  // const ifp = path.resolve('testImport.csv');

  // Stores CSV data
  const institutions = [];

  // Read CSV
  fs.createReadStream(ifp)
  .pipe(csv())
  .on('data', (row) => {
    // Skip header row
    if (row['institution_id'] !== 'id') {
      institutions.push({
        institution_id: row.id, // institution_id
        name: row.ror_display, // name
        acronym: row.acronym, // name acrony
        alias: row.alias, // name alias
        label: row.label, // name label
        country: row.country_name,  // country
        createdAt: row.created, // date created
        updatedAt: row.last_modified // data modified
      });
    }
  })
  .on('end', async () => {
    try {
      // Iterate through array and create the record
      for (const record of institutions) {
        console.log(record);

        await Institution.create(record)
      };

      console.log('Institutions successfully created');
      res.status(200).json(institutions[0]);

    } catch(error) {
      console.error('Error creating institutions:', error);
      res.status(500).json({ error: error.message});
    }
  });
}

// Updates all of the institutions in the updateInstitutions csv file
// Put the most recently updated records in this csv
const updateInstitutionsCSV = async (req, res) => {
  const ifp = path.resolve('createInstitutions.csv');
  // const ifp = path.resolve('testImport.csv');

  // Stores CSV data
  const institutions = [];

  // Read CSV
  fs.createReadStream(ifp)
  .pipe(csv())
  .on('data', (row) => {
    // Skip header row
    if (row['institution_id'] !== 'id') {
      institutions.push({
        institution_id: row.id, // institution_id
        name: row.ror_display, // name
        acronym: row.acronym, // name acrony
        alias: row.alias, // name alias
        label: row.label, // name label
        country: row.country_name,  // country
        createdAt: row.created, // date created
        updatedAt: row.last_modified // data modified
      });
    }
  })
  .on('end', async () => {
    try {
      // Iterate through array and create the record
      for (const record of institutions) {
        console.log(record);

        const target = await Institution.findByPk(record.institution_id);

        await target.update(record);
      };

      console.log('Institutions successfully created');
      res.status(200).json(institutions[0]);

    } catch(error) {
      console.error('Error creating institutions:', error);
      res.status(500).json({ error: error.message});
    }
  });
}

module.exports = {
  importInstitutionsCSV,
  createInstitutionsCSV,
  updateInstitutionsCSV
};
