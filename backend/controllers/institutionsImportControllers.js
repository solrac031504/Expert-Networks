// import DB models
const Institution = require('../models/Institution');

const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');


const axios = require('axios'); //Import axios for http requests
const { query } = require('express');
const sequelize = require('../database');

require('dotenv').config(); //Import dotenv for environment variables

const importInstitutionsCSV = async (req, res) => {
  const ifp = path.resolve('v1.50-2024-07-29-ror-data_schema_v2.csv');
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
      // await Institution.bulkCreate(institutions);
      // debugging
      // let i = 1;

      for (const record of institutions) {
        // find an existing institution with this ID
        // existingInstitution is NULL if no record is found
        let existingInstitution = await Institution.findByPk(record.institution_id);

        // create if institution does not exist
        if (!existingInstitution) {
          await Institution.create({
            institution_id: record.institution_id,
            name: record.name,
            acronym: record.acronym,
            alias: record.alias,
            label: record.label,
            country: record.country,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt
          });
        } else {
          // If it does exist, update the information
          await existingInstitution.update({
            institution_id: record.institution_id,
            name: record.name,
            acronym: record.acronym,
            alias: record.alias,
            label: record.label,
            country: record.country,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt
          });
        }

        // console.log(i);
        // i++;
      };

      console.log('Institutions successfully imported and inserted');
      res.status(200).json(institutions[0]);

    } catch(error) {
      console.error('Error inserting institutions:', error);
      res.status(500).json({ error: error.message});
    }
  });
}

const createInstitutionsCSV = async (req, res) => {

}

const updateInstitutionsCSV = async (req, res) => {

}

module.exports = {
  importInstitutionsCSV,
  createInstitutionsCSV,
  updateInstitutionsCSV
};
