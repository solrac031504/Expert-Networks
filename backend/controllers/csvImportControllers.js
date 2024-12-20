// import DB models
const Author = require('../models/Author');
const Topic = require('../models/Topic');
const AuthorTopic = require('../models/AuthorTopic');
const Subfield = require('../models/Subfield');
const Institution = require('../models/Institution');

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
  if(!raw_id) return null;
  const match = raw_id.match(/T(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

// All subfield ID follow the pattern https://openalex.org/subfields/####
// Only want the #### for faster indexing
const extractSubfieldID = (raw_id) => {
  if(!raw_id) return null;
  const match = raw_id.match(/subfields\/(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

// All field ID follow the pattern https://openalex.org/fields/##
// Only want the ## for faster indexing
const extractFieldID = (raw_id) => {
  if(!raw_id) return null;
  const match = raw_id.match(/fields\/(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

// All domain ID follow the pattern https://openalex.org/domains/#
// Only want the # for faster indexing
const extractDomainID = (raw_id) => {
  if(!raw_id) return null;
  const match = raw_id.match(/domains\/(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

// All author ID follow the pattern https://openalex.org/authors/A##########
// Only want the ########## for faster indexing
const extractAuthorID = (raw_id) => {
  if(!raw_id) return null;
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

      let extracted_subfield_id = extractSubfieldID(row.subfield_id);
      let extracted_topic_id = extractTopicID(row.id);

      // only push if it exists, i.e., not NULL
      if (extracted_topic_id) {
        topics.push({
          id: extracted_topic_id, 
          display_name: row.display_name,
          keywords: row.keywords,
          wikipedia_id: row.wikipedia_id,
          subfield_id: extracted_subfield_id
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

  // Stores CSV data
  const subfields = [];

  // Read CSV
  fs.createReadStream(ifp)
  .pipe(csv())
  .on('data', (row) => {
    // Skip header row OR empty row
    if (row['id'] !== 'subfield_id') {
      // console.log("Raw row:", row);

      let extracted_subfield_id = extractSubfieldID(row.subfield_id);
      let extracted_field_id = extractFieldID(row.field_id);

      subfields.push({
        id: extracted_subfield_id, 
        display_name: row.subfield_display_name,
        field_id: extracted_field_id
      });
    }
  })
  .on('end', async () => {
    try {
      // Use bulkCreate and updateOnDuplicate to improve import times
      // Increments of 1000
      for (let i = 0; i < subfields.length; i += 1000) {
        // Lower bound is the current i value, increments of 1000
        let lowerBound = i;
        // Upper bound is 
        let upperBound = (i+1000 > subfields.length) ? subfields.length : i + 1000

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
  let j = 0;
  const readStream = fs.createReadStream(ifp)
  readStream
  .pipe(csv())
  .on('data', (row) => {
    // Only read the first 100 for debugging
    // if (j === 100) {
    //   readStream.pause();
    //   readStream.emit('end');
    // }
    // Skip header row OR empty row
    if (row['id'] !== 'id' && row['id']) {
      // console.log(row);
      // Exctract the id number
      let extracted_author_id = extractAuthorID(row.id);
      // only push if it exists, i.e., not NULL
      // AND citations > 0
      if (extracted_author_id && parseInt(row.cited_by_count) > 0) {
        authors.push({
          id: extracted_author_id,
          display_name: row.display_name,
          works_count: Number.isNaN(parseInt(row.works_count)) ? 0 : parseInt(row.works_count),
          cited_by_count: Number.isNaN(parseInt(row.cited_by_count)) ? 0 : parseInt(row.cited_by_count),
          hindex: Number.isNaN(parseInt(row.h_index)) ? 0 : parseInt(row.h_index),
          i_ten_index: Number.isNaN(parseInt(row.i10_index)) ? 0 : parseInt(row.i10_index),
          impact_factor: Number.isNaN(parseFloat(row['2yr_mean_citedness'])) ? 0 : parseFloat(row['2yr_mean_citedness']),
          last_known_institution_id: (row.last_known_institution === '') ? '000000' : row.last_known_institution,
          works_count_2yr: Number.isNaN(parseInt(row['2yr_works_count'])) ? 0 : parseInt(row['2yr_works_count']),
          cited_by_count_2yr: Number.isNaN(parseInt(row['2yr_cited_by_count'])) ? 0 : parseInt(row['2yr_cited_by_count']),
          hindex_2yr: Number.isNaN(parseInt(row['2yr_h_index'])) ? 0 : parseInt(row['2yr_h_index']),
          i_ten_index_2yr: Number.isNaN(parseInt(row['2yr_i10_index'])) ? 0 : parseInt(row['2yr_i10_index'])
        });
        // console.log(authors[authors.length - 1]);
      }
    }
    // j++;
  })
  .on('end', async () => {
    try {
      // Use bulkCreate and updateOnDuplicate to improve import times
      // Increments of 1000
      for (let i = 0; i < authors.length; i += 1000) {
        // Lower bound is the current i value, increments of 1000
        let lowerBound = i;
        // Upper bound is 
        let upperBound = (i + 1000 > authors.length) ? authors.length : i + 1000;

        // console.log(`(${lowerBound},${upperBound})`);

        let records = authors.slice(lowerBound, upperBound);
        // console.log(records);
        await Author.bulkCreate(records, {
          updateOnDuplicate: [
            'id',
            'display_name',
            'works_count',
            'cited_by_count',
            'hindex',
            'i_ten_index',
            'impact_factor',
            'last_known_institution_id',
            'works_count_2yr',
            'cited_by_count_2yr',
            'hindex_2yr',
            'i_ten_index_2yr'
          ]
        }, { logging: false });
      }

      console.log(`${(authors.length).toLocaleString()} authors successfully imported and inserted`);
      res.status(200).json(authors[0]);

    } catch(error) {
      console.error('Error inserting authors:', error);
      res.status(500).json({ error: error.message});
    }
  });
}

// import all OpenAlex author-topics from CSV
const importAuthorTopicsCSV = async (req, res) => {
  const ifp = path.resolve('author_topics.csv');

  // Stores CSV data
  const author_topics = [];

  // Read CSV
  // let j = 0;
  const readStream = fs.createReadStream(ifp)
  readStream
  .pipe(csv())
  .on('data', (row) => {
    // Only read the first 100 for debugging
    // if (j === 100) {
    //   readStream.pause();
    //   readStream.emit('end');
    // }
    // Skip header row OR empty row
    if (row['author_id'] !== 'author_id' && row['topic_id'] !== 'topic_id' && row['author_id'] && row['topic_id']) {
      // Exctract the id number
      let extracted_author_id = extractAuthorID(row.author_id);
      let extracted_topic_id = extractTopicID(row.topic_id);
      // only push if it exists, i.e., not NULL
      if (extracted_author_id && extracted_topic_id) {
        author_topics.push({
          author_id: extracted_author_id,
          topic_id: extracted_topic_id
        });
      }
    }
    // j++;
  })
  .on('end', async () => {
    try {
      // Use bulkCreate and updateOnDuplicate to improve import times
      // Increments of 1000
      let error_ids = [];
      for (let i = 0; i < author_topics.length; i += 1000) {
        // Lower bound is the current i value, increments of 1000
        let lowerBound = i;
        // Upper bound is 
        let upperBound = Math.min(i + 1000, author_topics.length);

        // console.log(`(${lowerBound},${upperBound})`);

        let records = author_topics.slice(lowerBound, upperBound);
        // console.log(records);
        // await AuthorTopic.bulkCreate(records, {
        //   updateOnDuplicate: [
        //     'author_id',
        //     'topic_id'
        //   ]
        // });

        try {
          await AuthorTopic.bulkCreate(records, {
            updateOnDuplicate: [
              'author_id',
              'topic_id'
            ]
          }, { logging: false });
        } catch(error) {
          // If the bulk insertion failes, iterate through and update/create manually
          // Store failed values in the error_id array
          try {

          } catch(error) {
            
          }
          for (const record of records) {
            try {
              // Find the record based on the composite PK
              // Created is true if the value was created
              const [existingPair, created] = await AuthorTopic.findOrCreate({
                where: {
                  author_id: record.author_id,
                  topic_id: record.topic_id
                }
              });

              // If created is false (i.e., already existed), then update the record
              if (!created) existingPair.update(record);
            } catch(error) {
              // Upon failure, save the id pair for debugging
              error_ids.push(record);
            }
          }
        }
      }

      console.log('Errors:', error_ids);
      console.log(`${(author_topics.length).toLocaleString()} author-topic pairs successfully imported and inserted`);
      res.status(200).json(author_topics[0]);

    } catch(error) {
      console.error('Error inserting author-topic pairs:', error);
      res.status(500).json({ error: error.message});
    }
  });
}

// Updates all institution records in the database
// NOTE: Requires minmal data cleaning. Please reference design document "Import ROR Data"
const importInstitutionsCSV = async (req, res) => {
  const ifp = path.resolve('institutions.csv');
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
        name: row.ror_display, // name
        acronym: row.acronym, // name acronym
        alias: row.alias, // name alias
        label: row.label, // name label
        country_code: row.country_code, // alpha2 code
        status: row.status, // status
        types: row.types, // type of institution
        createdAt: row.created, // date created
        updatedAt: row.last_modified // data modified
      });
    }
  })
  .on('end', async () => {
    try {
      // Use bulkCreate and updateOnDuplicate to improve import times
      // Increments of 1000
      for (let i = 0; i < institutions.length; i += 1000) {
        // Lower bound is the current i value, increments of 1000
        let lowerBound = i;
        // Upper bound is 
        let upperBound = (i+1000 > institutions.length) ? institutions.length : i + 1000

        let records = institutions.slice(lowerBound, upperBound);
        await Institution.bulkCreate(records, {
          updateOnDuplicate: ['name', 'acronym', 'alias', 'label', 'country_code', 'status', 'types', 'createdAt', 'updatedAt']
        });
      }

      console.log('Institutions successfully imported');
      res.status(200).json(institutions[0]);

    } catch(error) {
      console.error('Error importing institutions:', error);
      res.status(500).json({ error: error.message});
    }
  });
}

module.exports = {
  importSubfieldsCSV,
  importTopicsCSV,
  importAuthorsCSV,
  extractTopicID,
  importAuthorTopicsCSV,
  importInstitutionsCSV
};