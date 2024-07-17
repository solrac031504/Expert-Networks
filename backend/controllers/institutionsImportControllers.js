// import DB models
const Institution = require('../models/Institution');

const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');


const axios = require('axios'); //Import axios for http requests
const { query } = require('express');

require('dotenv').config(); //Import dotenv for environment variables

const importInstitutionsCSV = async (req, res) => {
  const ifp = path.resolve('v1.48-2024-06-20-ror-data_schema_v2.csv');
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
        name: row.name, // name
        country: row.country  // country
      });
    }
    console.log(row); 
  })
  .on('end', async () => {
    try {
      await Institution.bulkCreate(institutions);
      console.log('Institutions successfully imported and inserted');
      res.status(200).json(institutions[0]);

    } catch(error) {
      console.error('Error inserting institutions:', error);
      res.status(500).json({ error: error.message});
    }
  });
}

module.exports = {
  importInstitutionsCSV
};
