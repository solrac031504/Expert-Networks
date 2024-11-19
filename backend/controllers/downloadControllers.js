const PDFDocument = require('pdfkit'); 
const Expert = require('../models/Expert');
const Institution = require('../models/Institution');
const { Sequelize, Op, QueryTypes } = require('sequelize');
const createCsvWriter = require('csv-writer').createObjectCsvStringifier;
const path = require('path');
const fs = require('fs');
const axios = require('axios'); 
const { query } = require('express');
const sequelize = require('../database');
const ExcelJS = require('exceljs');
const { Document, Packer, Table, TableRow, TableCell, Paragraph, TextRun } = require("docx");
const { StringDecoder } = require("string_decoder");

const { fetchExperts } = require('./searchControllers');

require('dotenv').config();

const sortAndFilterResults = (sorting, is_global_south, raw_experts) => {
  const sortedResults = [...raw_experts]; // Create a copy of the current results to sort
  
  // Sort based on the selected param
  switch (sorting) {
    case 'works_asc':
      sortedResults.sort((a, b) => a.works_count - b.works_count);
      break;
    case 'works_desc':
      sortedResults.sort((a, b) => b.works_count - a.works_count);
      break;
    case 'citations_asc':
      sortedResults.sort((a, b) => a.cited_by_count - b.cited_by_count);
      break;
    case 'citations_desc':
      sortedResults.sort((a, b) => b.cited_by_count - a.cited_by_count);
      break;
    case 'hindex_asc':
      sortedResults.sort((a, b) => a.hindex - b.hindex);
      break;
    case 'hindex_desc':
      sortedResults.sort((a, b) => b.hindex - a.hindex);
      break;
    case 'i10index_asc':
      sortedResults.sort((a, b) => a.i_ten_index - b.i_ten_index);
      break;
    case 'i10index_desc':
      sortedResults.sort((a, b) => b.i_ten_index - a.i_ten_index);
      break;
    case 'impact_factor_asc':
      sortedResults.sort((a, b) => a.impact_factor - b.impact_factor);
      break;
    case 'impact_factor_desc':
      sortedResults.sort((a, b) => b.impact_factor - a.impact_factor);
      break;
    default:
      break;
  }

  // Filter results based on the global south selection
  const filteredResults = sortedResults.filter(result => {
    if (is_global_south === "0") {
      return true; // Include all results
    } else if (is_global_south === "1") {
      return result.is_global_south === 0; // Exclude Global South
    } else if (is_global_south === "2") {
      return result.is_global_south === 1; // Only Global South
    }
    return true; // Default case (if no selection, include all)
  });

  return filteredResults;
};

// Returns the display_name of the narrowest selected field of study
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

// Limit the search results
// Return the top 'limit' records
const limitSearchResults = (raw_search, limit) => {
  return raw_search.slice(0, limit);
};

// All functions for downloads start the same, so compress them into a single function
// Extract query params
// Retrieve experts from cache
// Sort and filter the results
// Limit the results
// Return the processed array
const getExperts = async (queryParams) => {
  // Extract sorting into one variable,
  // put everything else into another variable
  // Redis cached value key does not include the sorted sequence for finding the experts, therefore
  // the argument for fetchExperts cannot contain the field for sorting
  const { sorting, is_global_south, limit, ...query_no_sorting } = queryParams;

  // Retrieve experts from cache
  const raw_experts = await fetchExperts(query_no_sorting);

  const experts = sortAndFilterResults(sorting, is_global_south, raw_experts);

  // Limit the results and return the limited reuslts
  return limitSearchResults(experts, limit);
};

const exportExpertsToXLS = async (req, res) => {
  try {
    const experts = await getExperts(req.query);
    const field_of_study = await getNarrowestSelectedField(req.query);

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
    const experts = await getExperts(req.query);
    const field_of_study = await getNarrowestSelectedField(req.query);

    // Map field_of_study to each expert record
    const expertsWithField = experts.map(expert => ({
      ...expert,
      field_of_study: field_of_study
    }));

    // Create CSV stringifier
    const csvStringifier = createCsvWriter({
      header: [
        { id: 'author_name', title: 'Name' },
        { id: 'field_of_study', title: 'Selected Field of Study' },
        { id: 'institution_name', title: 'Institution' },
        { id: 'country_name', title: 'Country' },
        { id: 'works_count', title: 'Number of Works' },
        { id: 'cited_by_count', title: 'Times Cited' },
        { id: 'hindex', title: 'H-index' },
        { id: 'i_ten_index', title: 'I10-index' },
        { id: 'impact_factor', title: 'Impact Factor' },
      ]
    });

    // Set headers for CSV response with UTF-8 BOM for encoding support
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=experts.csv');
    
    // Write BOM to ensure UTF-8 encoding is detected
    res.write('\uFEFF');
    
    // Write CSV headers and rows
    res.write(csvStringifier.getHeaderString());
    res.write(csvStringifier.stringifyRecords(expertsWithField));

    res.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const exportExpertsToPDF = async (req, res) => {
  try {
    const experts = await getExperts(req.query);
    const field_of_study = await getNarrowestSelectedField(req.query);

    const doc = new PDFDocument();

    // Set headers for the PDF response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=experts.pdf');

    // Pipe PDF into response
    doc.pipe(res);

    // Define the absolute path to the font file
    const notoSansPath = path.resolve(__dirname, '../fonts/Noto_Sans/NotoSans-VariableFont_wdth,wght.ttf');

    // Check if the font file exists (optional)
    const fs = require('fs');
    if (!fs.existsSync(notoSansPath)) {
      throw new Error(`Font file not found at path: ${notoSansPath}`);
    }

    // Register the font
    doc.registerFont('NotoSans', notoSansPath);
    doc.font('NotoSans');  // Use the new font

    // Add title
    doc.fontSize(16).text('Experts List', { align: 'center' });
    doc.moveDown();

    // Map field_of_study to each expert record
    const expertsWithField = experts.map(expert => ({
      ...expert,
      field_of_study: field_of_study
    }));

    // Define table headers and column positions
    const tableTop = 100;
    const columnPositions = {
      name: 50,
      field_of_study: 130,
      institution: 230,
      country: 330,
      works_count: 390,
      cited_by_count: 430,
      hindex: 470,
      i_ten_index: 500,
      impact_factor: 530
    };

    // Column widths
    const columnWidths = {
      name: 80,
      field_of_study: 90,
      institution: 90,
      country: 50,
      works_count: 30,
      cited_by_count: 30,
      hindex: 30,
      i_ten_index: 30,
      impact_factor: 30
    };

    // Set font size for the table
    const fontSize = 8;

    // Function to calculate row height based on wrapped text
    const calculateRowHeight = (text, width) => {
      const lineHeight = 10; // Line height for the font
      const lines = doc.heightOfString(text, { width: width });
      return Math.ceil(lines / lineHeight) * lineHeight;
    };

    // Wrap headers by providing width constraint
    const headers = [
      { text: 'Name', width: columnWidths.name },
      { text: 'Selected Field of Study', width: columnWidths.field_of_study },
      { text: 'Institution', width: columnWidths.institution },
      { text: 'Country', width: columnWidths.country },
      { text: 'Number of Works', width: columnWidths.works_count },
      { text: 'Times Cited', width: columnWidths.cited_by_count },
      { text: 'H-index', width: columnWidths.hindex },
      { text: 'I10-index', width: columnWidths.i_ten_index },
      { text: 'Impact Factor', width: columnWidths.impact_factor }
    ];

    // Calculate the maximum height of the header row to avoid overlap
    const headerHeight = Math.max(
      ...headers.map(header => calculateRowHeight(header.text, header.width))
    );

    // Reduce space before drawing the line by adjusting header height
    const adjustedHeaderHeight = headerHeight * 0.25; // Reduce height slightly for a tighter fit

    // Draw table headers
    headers.forEach((header, index) => {
      doc.fontSize(fontSize).text(header.text, columnPositions[Object.keys(columnPositions)[index]], tableTop, {
        width: header.width,
        align: 'left'
      });
    });

    // Draw a line under the table header, adjusting its position
    doc.moveTo(50, tableTop + adjustedHeaderHeight).lineTo(560, tableTop + adjustedHeaderHeight).stroke();

    // Set initial row position
    let rowPosition = tableTop + adjustedHeaderHeight + 5; // Fine-tune spacing here

    // Iterate through experts and add rows to the table
    expertsWithField.forEach(expert => {
      // Calculate the maximum row height for the current row based on all columns
      const rowHeight = Math.max(
        calculateRowHeight(expert.author_name, columnWidths.name),
        calculateRowHeight(expert.field_of_study, columnWidths.field_of_study),
        calculateRowHeight(expert.institution_name || 'N/A', columnWidths.institution),
        calculateRowHeight(expert.country_name || 'N/A', columnWidths.country)
      );

      // Add wrapped text for each column
      doc.fontSize(fontSize).text(expert.author_name, columnPositions.name, rowPosition, {
        width: columnWidths.name
      });
      doc.text(expert.field_of_study, columnPositions.field_of_study, rowPosition, {
        width: columnWidths.field_of_study
      });
      doc.text(expert.institution_name || 'N/A', columnPositions.institution, rowPosition, {
        width: columnWidths.institution
      });
      doc.text(expert.country_name || 'N/A', columnPositions.country, rowPosition, {
        width: columnWidths.country
      });
      doc.text(expert.works_count.toString(), columnPositions.works_count, rowPosition, {
        width: columnWidths.works_count
      });
      doc.text(expert.cited_by_count.toString(), columnPositions.cited_by_count, rowPosition, {
        width: columnWidths.cited_by_count
      });
      doc.text(expert.hindex.toString(), columnPositions.hindex, rowPosition, {
        width: columnWidths.hindex
      });
      doc.text(expert.i_ten_index.toString(), columnPositions.i_ten_index, rowPosition, {
        width: columnWidths.i_ten_index
      });
      doc.text(expert.impact_factor.toString(), columnPositions.impact_factor, rowPosition, {
        width: columnWidths.impact_factor
      });

      // Move down for the next row
      rowPosition += rowHeight + 8;

      // Add a page break if needed
      if (rowPosition > 600) {
        doc.addPage();
        rowPosition = 50; // Reset row position for the new page
      }
    });

    // Finalize the PDF
    doc.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const exportExpertsToWord = async (req, res) => {
  try {
    const experts = await getExperts(req.query);
    const field_of_study = await getNarrowestSelectedField(req.query);

    // Map field_of_study to each expert record
    const expertsWithField = experts.map(expert => ({
      ...expert,
      field_of_study: field_of_study,
    }));

    // Create table headers
    const tableHeaders = [
      new TableCell({
        children: [new Paragraph({ text: 'Name', bold: true })],
      }),
      new TableCell({
        children: [new Paragraph({ text: 'Selected Field of Study', bold: true })],
      }),
      new TableCell({
        children: [new Paragraph({ text: 'Institution', bold: true })],
      }),
      new TableCell({
        children: [new Paragraph({ text: 'Country', bold: true })],
      }),
      new TableCell({
        children: [new Paragraph({ text: 'Number of Works', bold: true })],
      }),
      new TableCell({
        children: [new Paragraph({ text: 'Times Cited', bold: true })],
      }),
      new TableCell({
        children: [new Paragraph({ text: 'H-index', bold: true })],
      }),
      new TableCell({
        children: [new Paragraph({ text: 'I10-index', bold: true })],
      }),
      new TableCell({
        children: [new Paragraph({ text: 'Impact Factor', bold: true })],
      }),
    ];

    // Create rows for the table
    const tableRows = [
      new TableRow({
        children: tableHeaders,
      }),
      ...expertsWithField.map(expert => new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph(expert.author_name)],
          }),
          new TableCell({
            children: [new Paragraph(expert.field_of_study)],
          }),
          new TableCell({
            children: [new Paragraph(expert.institution_name || 'N/A')],
          }),
          new TableCell({
            children: [new Paragraph(expert.country_name || 'N/A')],
          }),
          new TableCell({
            children: [new Paragraph(expert.works_count.toString())],
          }),
          new TableCell({
            children: [new Paragraph(expert.cited_by_count.toString())],
          }),
          new TableCell({
            children: [new Paragraph(expert.hindex.toString())],
          }),
          new TableCell({
            children: [new Paragraph(expert.i_ten_index.toString())],
          }),
          new TableCell({
            children: [new Paragraph(expert.impact_factor.toString())],
          }),
        ],
      })),
    ];

    // Create the table
    const table = new Table({
      rows: tableRows,
      width: {
        size: 100,
        type: 'pct',
      },
    });

    //  create new Word document with sections
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [table],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);

    // Headers for the Word document 
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename=experts.docx');

    res.status(200).send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  exportExpertsToCSV,
  exportExpertsToPDF,
  exportExpertsToXLS,
  exportExpertsToWord
};
