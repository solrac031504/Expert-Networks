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

const exportExpertsToXLS = async (req, res) => {
  try {
    //const experts = await fetchExperts(req.query);
    const experts = await Expert.findAll({limit : 100});
    const results = experts.map(expert => expert.get({ plain: true }));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Experts');

    worksheet.columns = [
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Field of Study', key: 'field_of_study', width: 30 },
      { header: 'Institution', key: 'institution', width: 30 },
      { header: 'Country', key: 'country', width: 15 },
      { header: 'Times Cited', key: 'citations', width: 15 },
      { header: 'H-index', key: 'hindex', width: 10 },
      { header: 'I10-index', key: 'i_ten_index', width: 10 },
      { header: 'Impact Factor', key: 'impact_factor', width: 15 },
      { header: 'Age', key: 'age', width: 10 },
      { header: 'Years in Field', key: 'years_in_field', width: 15 },
      { header: 'Email', key: 'email', width: 30 },
    ];

    results.forEach(expert => {
      worksheet.addRow(expert);
    });

    // Set headers for the XLSX response
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=experts.xlsx');

    await workbook.xlsx.write(res);
    res.status(200).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const exportExpertsToCSV = async (req, res) => {
  try {
    const experts = await fetchExperts(req.query);
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
  try {
    const experts = await Expert.findAll({ limit: 100 });
    const results = experts.map(expert => expert.get({ plain: true }));

    const doc = new PDFDocument();

    // Set headers for the PDF response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=experts.pdf');

    // Pipe PDF into response
    doc.pipe(res);

    // Add title
    doc.fontSize(20).text('Experts List', { align: 'center' });
    doc.moveDown();

    // Iterate through each expert and format their details
    results.forEach(expert => {
      // Add each expert's details in a table-like structure
      doc.fontSize(12).text(`Name: ${expert.name}`);
      doc.text(`Field of Study: ${expert.field_of_study}`);
      doc.text(`Institution: ${expert.institution || 'Undefined'}`);
      doc.text(`Country: ${expert.region || 'Undefined'}`);
      doc.text(`Citations: ${expert.citations}`);
      doc.text(`H-index: ${expert.hindex}`);
      doc.text(`I10-index: ${expert.i_ten_index}`);
      doc.text(`Impact Factor: ${expert.impact_factor || '0'}`);
      doc.text(`Age: ${expert.age || 'Undefined'}`);
      doc.text(`Years in Field: ${expert.years_in_field || '0'}`);
      doc.text(`Email: ${expert.email}`);

      doc.moveDown(2); 
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
