const PDFDocument = require('pdfkit'); 
const Expert = require('../models/Expert');
const Institution = require('../models/Institution');
const { Sequelize, Op, QueryTypes } = require('sequelize');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const fs = require('fs');
const axios = require('axios'); 
const { query } = require('express');
const sequelize = require('../database');

require('dotenv').config(); 

const exportExpertsToCSV = async (req, res) => {
  const { field_of_study, institution, region } = req.query;

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
    // const experts = await Expert.find({}).sort({ createdAt: -1 });
    const experts = await Expert.findAll({
      attributes: [
        'name',
        'field_of_study',
        [Sequelize.col('Institution.name'), 'institution'],
        [Sequelize.col('Institution.country'), 'country'],
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
  });

    console.log(experts);

    const results = experts.map(expert => expert.get({ plain: true }));

    const csvWriter = createCsvWriter({
      path: path.join(__dirname, '../exports/experts.csv'),
      header: [
        { id: 'name', title: 'Name' },
        { id: 'field_of_study', title: 'Field of Study' },
        { id: 'institution', title: 'Institution' },
        { id: 'country', title: 'Country' },
        { id: 'citations', title: 'Times Cited' },
        { id: 'hindex', title: 'H-index' },
        { id: 'i_ten_index', title: 'I10-index' },
        { id: 'impact_factor', title: 'Impact Factor'},
        { id: 'age', title: 'Age' },
        { id: 'years_in_field', title: 'Years in Field' },
        { id: 'email', title: 'Email' }
      ]
    });

    // rewrite
    // Ensure the records are properly formatted
    // const records = experts.map(expert => ({
    //   name: expert.name,
    //   field_of_study: expert.field_of_study,
    //   institution: expert.institution,
    //   region: expert.country,
    //   citations: expert.citations,
    //   hindex: expert.hindex,
    //   i_ten_index: expert.i_ten_index,
    //   age: expert.age,
    //   years_in_field: expert.years_in_field,
    //   email: expert.email,
    // }));

    // await csvWriter.writeRecords(records);
    await csvWriter.writeRecords(results);

    const filePath = path.join(__dirname, '../exports/experts.csv');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=experts.csv');
    res.download(filePath, 'experts.csv');

    res.status(200).json(experts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const exportExpertsToPDF = async (req, res) => {
  const { field_of_study, institution, region } = req.query;

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
    const experts = await Expert.findAll({
      attributes: [
        'name',
        'field_of_study',
        [Sequelize.col('Institution.name'), 'institution'],
        [Sequelize.col('Institution.country'), 'country'],
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
        attributes: [], 
        required: false, // This makes it a LEFT JOIN
      }],
      where: query,
    });

    const results = experts.map(expert => expert.get({ plain: true }));

    const doc = new PDFDocument();
    const filePath = path.join(__dirname, '../exports/experts.pdf');

    // Turn PDF directly into response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=experts.pdf');

    doc.pipe(res);

    doc.fontSize(20).text('Experts Report', { align: 'center' });
    doc.moveDown();

    results.forEach(expert => {
      doc.fontSize(12).text(`Name: ${expert.name}`);
      doc.text(`Field of Study: ${expert.field_of_study}`);
      doc.text(`Institution: ${expert.institution}`);
      doc.text(`Country: ${expert.country}`);
      doc.text(`Citations: ${expert.citations}`);
      doc.text(`H-index: ${expert.hindex}`);
      doc.text(`I10-index: ${expert.i_ten_index}`);
      doc.text(`Impact Factor: ${expert.impact_factor}`);
      doc.text(`Age: ${expert.age}`);
      doc.text(`Years in Field: ${expert.years_in_field}`);
      doc.text(`Email: ${expert.email}`);
      doc.moveDown();
    });

    doc.end();

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  exportExpertsToCSV,
  exportExpertsToPDF
};
