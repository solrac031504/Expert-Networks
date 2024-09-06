// import DB models
const Author = require('../models/Author');
const Topic = require('../models/Topic');
const AuthorTopic = require('../models/AuthorTopic');

const Subfield = require('../models/Subfield');

const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');


const axios = require('axios'); //Import axios for http requests
const { query } = require('express');
const sequelize = require('../database');

require('dotenv').config(); //Import dotenv for environment variables

// All topic ID follow the pattern https://openalex.org/T#####
// Only want the ##### for faster indexing
const extractTopicID = (raw_id) => {
  const match = raw_id.match(/T(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

// All subfield ID follow the pattern https://openalex.org/subfields/####
// Only want the #### for faster indexing
const extractSubfieldID = (raw_id) => {
  const match = raw_id.match(/subfields\/(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

// All field ID follow the pattern https://openalex.org/fields/##
// Only want the ## for faster indexing
const extractFieldID = (raw_id) => {
  const match = raw_id.match(/fields\/(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

// All domain ID follow the pattern https://openalex.org/domains/#
// Only want the # for faster indexing
const extractDomainID = (raw_id) => {
  const match = raw_id.match(/domains\/(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

// All author ID follow the pattern https://openalex.org/T##### https://openalex.org/authors/A##########
// Only want the ########## for faster indexing
const extractAuthorID = (raw_id) => {
  const match = raw_id.match(/A(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

// import all OpenAlex topics from CSV
const importTopicsCSV = async (req, res) => {
  const ifp = path.resolve('topics.csv');
  // const ifp = path.resolve('testImport.csv');

  // Stores CSV data
  const topics = [];

  // Read CSV
  fs.createReadStream(ifp)
  .pipe(csv())
  .on('data', (row) => {
    // Skip header row OR empty row
    if (row['id'] !== 'id') {
      // Exctract the id number for all of them
      // console.log("Raw row:", row);

      let extracted_domain_id = extractDomainID(row.domain_id);
      let extracted_field_id = extractFieldID(row.field_id);
      let extracted_subfield_id = extractSubfieldID(row.subfield_id);
      let extracted_topic_id = extractTopicID(row.id);

      // only push if it exists, i.e., not NULL
      if (extracted_topic_id) {
        topics.push({
          id: extracted_topic_id, 
          display_name: row.display_name,
          keywords: row.keywords,
          wikipedia_id: row.wikipedia_id,
          domain_id: extracted_domain_id, 
          domain_display_name: row.domain_display_name, 
          field_id: extracted_field_id,  
          field_display_name: row.field_display_name, 
          subfield_id: extracted_subfield_id, 
          subfield_display_name: row.subfield_display_name
        });
      }
    }
  })
  .on('end', async () => {
    try {
      // let i = 0;
      for (const record of topics) {
        // Debugging, only do first 100
        // if (i === 100) break;

        // find an existing topic with this ID
        // existingTopic is NULL if no record is found
        let existingTopic = await Topic.findByPk(record.id);

        // create if topic does not exist
        if (!existingTopic) {
          await Topic.create(record);
        } else {
          // If it does exist, update the information
          await existingTopic.update(record);
        }

        // console.log(i);
        // console.log(record);
        // i++;
      };

      console.log('Topics successfully imported and inserted');
      res.status(200).json(topics[0]);

    } catch(error) {
      console.error('Error inserting topics:', error);
      res.status(500).json({ error: error.message});
    }
  });
}

const importSubfieldsCSV = async (req, res) => {
  const ifp = path.resolve('subfields.csv');
  // const ifp = path.resolve('testImport.csv');

  // Stores CSV data
  const subfields = [];

  // Read CSV
  fs.createReadStream(ifp)
  .pipe(csv())
  .on('data', (row) => {
    // Skip header row OR empty row
    if (row['id'] !== 'subfield_id') {
      // console.log("Raw row:", row);

      subfields.push({
        id: row.subfield_id, 
        display_name: row.subfield_display_name,
        field_id: row.field_id
      });
    }
  })
  .on('end', async () => {
    try {
      // let i = 0;
      // for (const record of subfields) {
      //   // Debugging, only do first 100
      //   // if (i === 100) break;

      //   // find an existing topic with this ID
      //   // existingTopic is NULL if no record is found
      //   let existingSubfield = await Topic.findByPk(record.id);

      //   // create if topic does not exist
      //   if (!existingTopic) {
      //     await Topic.create(record);
      //   } else {
      //     // If it does exist, update the information
      //     await existingTopic.update(record);
      //   }

      //   // console.log(i);
      //   // console.log(record);
      //   // i++;
      // };

      // Use bulkCreate and updateOnDuplicate to improve import times
      // Increments of 1000
      for (let i = 0; i < subfields.length; i += 1000) {
        // Lower bound is the current i value, increments of 1000
        let lowerBound = i;
        // Upper bound is 
        let upperBound = (i+1000 > subfields.length) ? subfields.length : i + 1000

        console.log(`(${lowerBound},${upperBound})`);

        let records = subfields.slice(lowerBound, upperBound);
        await Subfield.bulkCreate(records, {
          updateOnDuplicate: ['id', 'display_name', 'field_id']
        });
      }

      console.log('Subfields successfully imported');
      res.status(200).json(subfields[0]);

    } catch(error) {
      console.error('Error inserting subfields:', error);
      res.status(500).json({ error: error.message});
    }
  });
}

// import all OpenAlex topics from CSV
const importAuthorsCSV = async (req, res) => {
  const ifp = path.resolve('authors.csv');
  // const ifp = path.resolve('testImport.csv');

  // Stores CSV data
  const authors = [];

  // Read CSV
  fs.createReadStream(ifp)
  .pipe(csv())
  .on('data', (row) => {
    // Skip header row OR empty row
    if (row['id'] !== 'id' || row['id'] !== '') {
      // Exctract the id number for all of them
      console.log("Raw row:", row);
      let extracted_author_id = extractAuthorID(row.id);

      // only push if it exists, i.e., not NULL
      if (extracted_author_id) {
        authors.push({
          id: extracted_author_id, 
          display_name: row.display_name,
          works_count: row.works_count,
          cited_by_count: row.cited_by_count,
          hindex: row.hindex,
          i_ten_index: row.i_ten_index,
          impact_factor: row.impact_factor,
          last_known_institution_id: row.last_known_institution_id, // uses the OpenAlex Institution ID, not ROR. Will not work for 
          works_count_2yr: row.works_count_2yr,
          cited_by_count_2yr: row.cited_by_count_2yr,
          hindex_2yr: row.hindex_2yr,
          i_ten_index_2yr: row.i_ten_index_2yr
        });
      }
    }
  })
  .on('end', async () => {
    try {
      let i = 0;
      for (const record of topics) {
        // Debugging, only do first 100
        if (i === 100) break;

        // find an existing topic with this ID
        // existingTopic is NULL if no record is found
        // let existingAuthor = await Author.findByPk(record.id);

        // create if topic does not exist
        // if (!existingAuthor) {
        //   await Author.create(record);
        // } else {
        //   // If it does exist, update the information
        //   await existingAuthor.update(record);
        // }

        // console.log(i);
        console.log(record);
        i++;
      };

      console.log('Authors successfully imported and inserted');
      res.status(200).json(authors[0]);

    } catch(error) {
      console.error('Error inserting authors:', error);
      res.status(500).json({ error: error.message});
    }
  });
}

module.exports = {
  importSubfieldsCSV,
  importTopicsCSV,
  importAuthorsCSV,
  extractTopicID
};
