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
  const { field_of_study, raw_institution, region, citations, hindex, i10, imp_fac, age, years } = req.query;

  // Format the institution String for LIKE matching %___%
  let temp = '%';
  institution = temp.concat(raw_institution, '%');
  
  // Applied to the WHERE clause of the SQL Query
  // If the var is not null AND it is not All, then the request is comma
  // delimited and added to the WHERE clause
  // The $$ allows selection of columns in a separate table since 
  // the main query selects from Experts
  let query = {};
  let order_query = [];

  if (field_of_study && field_of_study !== 'Field') query.field_of_study = {
    [Op.in]: field_of_study.split(',')
  };

  // if (institution && institution !== 'All') {
  //   query['$Institution.name$'] = {
  //     [Op.in]: institution.split(',')
  //   };
  // }

  // Uses LIKE operators, but can only do one entry at a time
  // Need to find a better way in this case
  if (raw_institution && raw_institution !== 'All') {
    query[Op.or] = [
      { '$Institution.name$': { [Op.like]: institution } },
      { '$Institution.acronym$': { [Op.like]: institution } },
      { '$Institution.alias$': { [Op.like]: institution } },
      { '$Institution.label$': { [Op.like]: institution } }
    ];
  }

  if (region && region !== 'Region') query['$Institution.country$'] = {
    [Op.in]: region.split(',')
  };

  // build order by
  if (citations)  order_query.push(['citations', citations]);
  if (hindex)  order_query.push(['hindex', hindex]);
  if (i10)  order_query.push(['i_ten_index', i10]);
  if (imp_fac)  order_query.push(['impact_factor', imp_fac]);
  if (age)  order_query.push(['age', age]);
  if (years)  order_query.push(['years_in_field', years]);

  console.log(query);
  console.log(order_query);

  try {
    const experts = await Expert.findAll({
        attributes: [
            'name',
            'field_of_study',
            [Sequelize.col('Institution.name'), 'institution'],
            [Sequelize.col('Institution.country'), 'region'],
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
        order: order_query
    });

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
    
    res.status(200);
    res.download(filePath, 'experts.csv');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const exportExpertsToPDF = async (req, res) => {
  const { field_of_study, raw_institution, region, citations, hindex, i10, imp_fac, age, years } = req.query;

  // Format the institution String for LIKE matching %___%
  let temp = '%';
  institution = temp.concat(raw_institution, '%');
  
  // Applied to the WHERE clause of the SQL Query
  // If the var is not null AND it is not All, then the request is comma
  // delimited and added to the WHERE clause
  // The $$ allows selection of columns in a separate table since 
  // the main query selects from Experts
  let query = {};
  let order_query = [];

  if (field_of_study && field_of_study !== 'Field') query.field_of_study = {
    [Op.in]: field_of_study.split(',')
  };

  // if (institution && institution !== 'All') {
  //   query['$Institution.name$'] = {
  //     [Op.in]: institution.split(',')
  //   };
  // }

  // Uses LIKE operators, but can only do one entry at a time
  // Need to find a better way in this case
  if (raw_institution && raw_institution !== 'All') {
    query[Op.or] = [
      { '$Institution.name$': { [Op.like]: institution } },
      { '$Institution.acronym$': { [Op.like]: institution } },
      { '$Institution.alias$': { [Op.like]: institution } },
      { '$Institution.label$': { [Op.like]: institution } }
    ];
  }

  if (region && region !== 'Region') query['$Institution.country$'] = {
    [Op.in]: region.split(',')
  };

  // build order by
  if (citations)  order_query.push(['citations', citations]);
  if (hindex)  order_query.push(['hindex', hindex]);
  if (i10)  order_query.push(['i_ten_index', i10]);
  if (imp_fac)  order_query.push(['impact_factor', imp_fac]);
  if (age)  order_query.push(['age', age]);
  if (years)  order_query.push(['years_in_field', years]);

  console.log(query);
  console.log(order_query);

  try {
    const experts = await Expert.findAll({
        attributes: [
            'name',
            'field_of_study',
            [Sequelize.col('Institution.name'), 'institution'],
            [Sequelize.col('Institution.country'), 'region'],
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
        order: order_query
    });

    const results = experts.map(expert => expert.get({ plain: true }));

    const doc = new PDFDocument();
    const filePath = path.join(__dirname, '../exports/experts.pdf');

    // Turn PDF directly into response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=experts.pdf');

    doc.pipe(res);

    doc.fontSize(20).text('Experts', { align: 'center' });
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
