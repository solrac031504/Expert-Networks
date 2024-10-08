// import DB models
const Expert = require('../models/Expert');
//const Institution = require('../models/Institution');

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const fs = require('fs');

const axios = require('axios'); //Import axios for http requests
const { query } = require('express');

require('dotenv').config(); //Import dotenv for environment variables

// get all experts
const getExperts = async (req, res) => {
  const experts = await Expert.findAll();

  res.status(200).json(experts);
}

// get a single expert
const getExpert = async (req, res) => {
  const { id } = req.params

  const expert = await Expert.findByPk(id)

  if (expert == null) {
    return res.status(404).json({error: 'No such expert'})
  }

  res.status(200).json(expert)
}

// create a new expert
const createExpert = async (req, res) => {
  // add to the database
  try {
    const expert = req.body;
    await Expert.create(expert);
    res.status(200).json(expert)
  } 
  catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// delete an expert
const deleteExpert = async (req, res) => {
  const { id } = req.params

  const expert = await Expert.destroy({
    where: {
      expert_id: id
    }
  });

  if(expert == null) {
    return res.status(400).json({error: 'No such expert'})
  }

  res.status(200).json(expert)
}

// update an expert
const updateExpert = async (req, res) => {
  const { id } = req.params

  const {
    expert_id,
    name,
    field_of_study,
    institution_id,
    citations,
    hindex,
    i_ten_index,
    impact_factor,
    age,
    years_in_field,
    email
  } = req.body;

  const expert = await Expert.update(
    {
      expert_id: expert_id,
      name: name,
      field_of_study: field_of_study,
      institution_id: institution_id,
      citations: citations,
      hindex: hindex,
      i_ten_index: i_ten_index,
      impact_factor: impact_factor,
      age: age,
      years_in_field: years_in_field,
      email: email
    },
    {
      where: {
        expert_id: id
      }
    }
  );

  if (expert == null) {
    return res.status(400).json({error: 'No such expert'})
  }

  res.status(200).json(expert)
}

/*
// search experts with query parameters
const searchExperts = async (req, res) => {
  const { field_of_study, institution, region } = req.query;

  let query = {};
  if (field_of_study && field_of_study !== 'All') query.field_of_study = field_of_study;
  if (institution && institution !== 'All') query.institution = institution;
  if (region && region !== 'All') query.region = region;

  try {
    const results = await Expert.find(query);
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
*/
/*
//Fetch for experts
const fetchExperts = async (req, res) => {

  //Use SerpAPI to fetch experts
  try {
    const API_KEY = process.env.SERPAPI_KEY;
    const initialURL = process.env.GOOGLE_SCHOLAR_PROFILES;
    const profilesNeeded = 50;
    const query = 'Machine Learning';

    let profiles = [];
    let pageToken = null;

    //while loop to fetch all profiles
    while (profiles.length < profilesNeeded) {

      //Fetch data from the API
      const params = {
        engine: "google_scholar_profiles",
        api_key: API_KEY,
        mauthors: 'Machine Learning',
        ...(pageToken && {after_author: pageToken})
      };

      const { data } = await axios.get(initialURL, {params});

      //Append data to profiles array
      profiles = profiles.concat(data.profiles);

      //Check if there is a next page
      if (data.pagination && data.pagination.next_page_token) {
        pageToken = data.pagination.next_page_token;
      }
      else {
        break;
      }
    }

    //Print data for debugging
    console.log(profiles);

    //Delete all experts in the database
    

    // Create or update experts in the database
    for (const profile of profiles) {
      // Ensure the institution exists in the Institutions table
      // let institution = await Institution.findOne({
      //   where: { name: profile.affiliations }
      // });

      // if (!institution) {
      //   institution = await Institution.create({
      //     name: profile.affiliations
      //   });
      // }

      const [expert, created] = await Expert.findOrCreate({
        where: { expert_id: profile.author_id },
        defaults: {
          expert_id: profile.author_id,
          name: profile.name,
          field_of_study: query,
          citations: profile.cited_by,
          hindex: 0,
          i_ten_index: 0,
          email: profile.email
        }
      });

      if (!created) {
        await expert.update({
          name: profile.name,
          field_of_study: query,
          citations: profile.cited_by,
          hindex: 0,
          i_ten_index: 0,
          email: profile.email
        });
      }

      console.log('Expert added or updated: ' + profile.name);
    }

    res.status(200).json({ message: 'Experts added to database' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching experts from API' });
  }
};
*/
/*
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
*/

module.exports = {
  getExperts,
  getExpert,
  createExpert,
  deleteExpert,
  updateExpert
  // getUniqueFields,
  // getUniqueInstitutions,
  // getUniqueRegions,
  // searchExperts,
  //  fetchExperts
  // exportExpertsToCSV
};
