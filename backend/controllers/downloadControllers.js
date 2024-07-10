// import DB models
const Expert = require('../models/Expert');
const Institution = require('../models/Institution');

const { Sequelize, Op, QueryTypes } = require('sequelize');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const fs = require('fs');

const axios = require('axios'); //Import axios for http requests
const { query } = require('express');
const sequelize = require('../database');

require('dotenv').config(); //Import dotenv for environment variables

const exportExpertsToCSV = async (req, res) => {
  let query = {};
  if (field_of_study && field_of_study !== 'All') query.field_of_study = {
    [Op.in]: field_of_study.split(',')
  };

  if (institution && institution !== 'All') query['$Institution.name$'] = {
    [Op.in]: institution.split(',')
  };

  if (region && region !== 'All') query['$Institution.country$'] = {
    [Op.in]: region.split(',')
  };

  try {
    // rewrite
    // const experts = await Expert.find({}).sort({ createdAt: -1 });
    const experts = await Expert.findAll({
      attributes: [
        'name',
        'field_of_study',
        Sequelize.col('Institution.name'),
        Sequelize.col('Institution.country'),
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
    logging: console.log
  });

    const csvWriter = createCsvWriter({
      path: path.join(__dirname, '../exports/experts.csv'),
      header: [
        { id: 'name', title: 'Name' },
        { id: 'field_of_study', title: 'Field of Study' },
        { id: 'institution', title: 'Institution' },
        { id: 'region', title: 'Country' },
        { id: 'citations', title: 'Times Cited' },
        { id: 'hindex', title: 'H-index' },
        { id: 'i_ten_index', title: 'I10-index' },
        { id: 'impact_factor', title: 'Impact Factor'},
        { id: 'age', title: 'Age' },
        { id: 'years_in_field', title: 'Years in Field' },
        { id: 'email', title: 'Email' },
        { id: 'createdAt', title: 'Created At' },
        { id: 'updatedAt', title: 'Updated At' }
      ]
    });

    // rewrite
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
