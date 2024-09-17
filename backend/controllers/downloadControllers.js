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

const { fetchExperts } = require('./searchControllers');

require('dotenv').config(); 

const exportExpertsToCSV = async (req, res) => {
  try {
    const experts = await fetchExperts(req.query);
    // const results = experts.map(expert => expert.get({ plain: true }));

    const csvWriter = createCsvWriter({
      path: path.join(__dirname, '../exports/experts.csv'),
      header: [
        { id: 'author_name', title: 'Name' },
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
    await csvWriter.writeRecords(experts);

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
    // const results = experts.map(expert => expert.get({ plain: true }));

    const doc = new PDFDocument();
    const filePath = path.join(__dirname, '../exports/experts.pdf');

    // Turn PDF directly into response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=experts.pdf');

    doc.pipe(res);

    doc.fontSize(20).text('Experts', { align: 'center' });
    doc.moveDown();

    experts.forEach(expert => {
      doc.fontSize(12).text(`Name: ${expert.author_name}`);
      doc.text(`Institution: ${expert.institution_name}`);
      doc.text(`Country: ${expert.country_name}`);
      doc.text(`Number of Works: ${expert.works_count}`)
      doc.text(`Times Cited: ${expert.cited_by_count}`);
      doc.text(`H-index: ${expert.hindex}`);
      doc.text(`I10-index: ${expert.i_ten_index}`);
      doc.text(`Impact Factor: ${expert.impact_factor}`);
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
