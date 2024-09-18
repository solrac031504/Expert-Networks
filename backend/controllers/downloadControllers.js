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
const ExcelJS = require('exceljs');

const { fetchExperts } = require('./searchControllers');

require('dotenv').config(); 

const getNarrowestSelectedField = async (queryParams) => {
  // These are IDs
  const { domain, field, subfield, topic } = queryParams;
  let field_of_study;

  // Start narrow, get more broad until one of them is true
  // This way, the most specific selection is used
  // If no selection, return ''
  if (topic) field_of_study = await sequelize.query(`SELECT display_name FROM Topics WHERE Topics.id=${topic}`, { type: QueryTypes.SELECT });
  else if (subfield) field_of_study = await sequelize.query(`SELECT display_name FROM Subfields WHERE Subfields.id=${subfield}`, { type: QueryTypes.SELECT });
  else if (field) field_of_study = await sequelize.query(`SELECT display_name FROM Fields WHERE Fields.id=${field}`, { type: QueryTypes.SELECT });
  else if (domain) field_of_study = await sequelize.query(`SELECT display_name FROM Domains WHERE Domains.id=${domain}`, { type: QueryTypes.SELECT });
  else return '';

  return field_of_study[0].display_name;
};

const exportExpertsToXLS = async (req, res) => {
  try {
    const experts = await fetchExperts(req.query);
    const field_of_study = await getNarrowestSelectedField(req.query);
    // const experts = await Expert.findAll({limit : 100});
    // const results = experts.map(expert => expert.get({ plain: true }));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Experts');

    worksheet.columns = [
      { header: 'Name', key: 'author_name', width: 20 },
      { header: 'Selected Field of Study', key: 'field_of_study', width: 30},
      { header: 'Institution', key: 'institution_name', width: 30 },
      { header: 'Country', key: 'country_name', width: 15 },
      { header: 'Number of Works', key: 'works_count', width: 15},
      { header: 'Times Cited', key: 'cited_by_count', width: 15 },
      { header: 'H-index', key: 'hindex', width: 10 },
      { header: 'I10-index', key: 'i_ten_index', width: 10 },
      { header: 'Impact Factor', key: 'impact_factor', width: 15 },
    ];

    // Map field_of_study to each expert record
    const expertsWithField = experts.map(expert => ({
      ...expert,
      field_of_study: field_of_study
    }));

    expertsWithField.forEach(expert => {
      worksheet.addRow(expert);
    });

    // Set headers for the XLSX response
    // const filePath = path.join(__dirname, '../exports/experts.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=experts.xlsx');

    await workbook.xlsx.write(res);
    res.status(200).end();
    // res.status(200);
    // res.download(filePath, 'experts.xlsx');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const exportExpertsToCSV = async (req, res) => {
  try {
    const experts = await fetchExperts(req.query);
    const field_of_study = await getNarrowestSelectedField(req.query);

    // const results = experts.map(expert => expert.get({ plain: true }));

    // Map field_of_study to each expert record
    const expertsWithField = experts.map(expert => ({
      ...expert,
      field_of_study: field_of_study
    }));

    const csvWriter = createCsvWriter({
      path: path.join(__dirname, '../exports/experts.csv'),
      header: [
        { id: 'author_name', title: 'Name' },
        { id: 'field_of_study', title: 'Selected Field of Study' },
        { id: 'institution_name', title: 'Institution' },
        { id: 'country_name', title: 'Country' },
        { id: 'works_count', title: 'Number of Works' },
        { id: 'cited_by_count', title: 'Times Cited' },
        { id: 'hindex', title: 'H-index' },
        { id: 'i_ten_index', title: 'I10-index' },
        { id: 'impact_factor', title: 'Impact Factor'},
      ]
    });

    // await csvWriter.writeRecords(records);
    await csvWriter.writeRecords(expertsWithField);

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
  try {
    const experts = await fetchExperts(req.query);
    const field_of_study = await getNarrowestSelectedField(req.query);

    // const results = experts.map(expert => expert.get({ plain: true }));

    const doc = new PDFDocument();

    // Set headers for the PDF response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=experts.pdf');

    // Pipe PDF into response
    doc.pipe(res);

    // Add title
    doc.fontSize(20).text('Experts List', { align: 'center' });
    doc.moveDown();

    // Map field_of_study to each expert record
    const expertsWithField = experts.map(expert => ({
      ...expert,
      field_of_study: field_of_study
    }));

    expertsWithField.forEach(expert => {
      doc.fontSize(12).text(`Name: ${expert.author_name}`);
      doc.text(`Selected Field of Study: ${expert.field_of_study}`);
      doc.text(`Institution: ${expert.institution_name}`);
      doc.text(`Country: ${expert.country_name}`);
      doc.text(`Number of Works: ${expert.works_count}`)
      doc.text(`Times Cited: ${expert.cited_by_count}`);
      doc.text(`H-index: ${expert.hindex}`);
      doc.text(`I10-index: ${expert.i_ten_index}`);
      doc.text(`Impact Factor: ${expert.impact_factor}`);
      doc.moveDown();
    });

    // Finalize the PDF
    doc.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  exportExpertsToCSV,
  exportExpertsToPDF,
  exportExpertsToXLS
};
