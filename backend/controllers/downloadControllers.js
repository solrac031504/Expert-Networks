// import DB models
const Expert = require('../models/Expert');

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const fs = require('fs');

const axios = require('axios'); //Import axios for http requests
const { query } = require('express');

require('dotenv').config(); //Import dotenv for environment variables

const exportExpertsToCSV = async (req, res) => {
  try {
    const experts = await Expert.find({}).sort({ createdAt: -1 });

    const csvWriter = createCsvWriter({
      path: path.join(__dirname, '../exports/experts.csv'),
      header: [
        { id: 'expert_id', title: 'Expert ID' },
        { id: 'name', title: 'Name' },
        { id: 'field_of_study', title: 'Field of Study' },
        { id: 'institution', title: 'Institution' },
        { id: 'region', title: 'Region' },
        { id: 'citations', title: 'Citations' },
        { id: 'hindex', title: 'H-index' },
        { id: 'il0_index', title: 'i10-index' },
        { id: 'age', title: 'Age' },
        { id: 'years_in_field', title: 'Years in Field' },
        { id: 'email', title: 'Email' },
        { id: 'createdAt', title: 'Created At' },
        { id: 'updatedAt', title: 'Updated At' }
      ]
    });

    // Ensure the records are properly formatted
    const records = experts.map(expert => ({
      expert_id: expert.expert_id,
      name: expert.name,
      field_of_study: expert.field_of_study,
      institution: expert.institution,
      region: expert.region,
      citations: expert.citations,
      hindex: expert.hindex,
      il0_index: expert.il0_index,
      age: expert.age,
      years_in_field: expert.years_in_field,
      email: expert.email,
      createdAt: expert.createdAt.toISOString(),
      updatedAt: expert.updatedAt.toISOString()
    }));

    await csvWriter.writeRecords(records);

    const filePath = path.join(__dirname, '../exports/experts.csv');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=experts.csv');
    res.download(filePath, 'experts.csv');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  exportExpertsToCSV
};
