const Expert = require('../models/expertModel');
const mongoose = require('mongoose');

const axios = require('axios'); //Import axios for http requests
const { query } = require('express');

require('dotenv').config(); //Import dotenv for environment variables

//Commented out due to issue with fetchExperts
/*
// get all experts
const getExperts = async (req, res) => {
  const experts = await Expert.find({}).sort({createdAt: -1})

  res.status(200).json(experts)
}

// get a single expert
const getExpert = async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({error: 'No such expert'})
  }

  const expert = await Expert.findById(id)

  if (!expert) {
    return res.status(404).json({error: 'No such expert'})
  }

  res.status(200).json(expert)
}
*/

// create a new expert
const createExpert = async (req, res) => {
  const {
    expert_id,
    name,
    field_of_study,
    institution,
    region,
    citations,
    hindex,
    i10index,
    age,
    years_in_field,
    email
  } = req.body

  // add to the database
  try {
    const expert = await Expert.create({
        expert_id,
        name,
        field_of_study,
        institution,
        region,
        citations,
        hindex,
        i10index,
        age,
        years_in_field,
        email
    })
    res.status(200).json(expert)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// delete an expert
const deleteExpert = async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({error: 'No such expert'})
  }

  const expert = await Expert.findOneAndDelete({_id: id})

  if(!expert) {
    return res.status(400).json({error: 'No such expert'})
  }

  res.status(200).json(expert)
}

// update an expert
const updateExpert = async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({error: 'No such expert'})
  }

  const expert = await Expert.findOneAndUpdate({author_id: author_id}, {
    ...req.body
  })

  if (!expert) {
    return res.status(400).json({error: 'No such expert'})
  }

  res.status(200).json(expert)
}

// get unique fields
const getUniqueFields = async (req, res) => {
  try {
    const fields = await Expert.distinct('field_of_study');
    res.status(200).json(fields);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get unique institutions
const getUniqueInstitutions = async (req, res) => {
  try {
    const institutions = await Expert.distinct('institution');
    res.status(200).json(institutions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get unique regions
const getUniqueRegions = async (req, res) => {

  try {
    const regions = await Expert.distinct('region');
    res.status(200).json(regions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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
    await Expert.deleteMany({});

    //Create or update experts in the database
    for (let i = 0; i < profiles.length; i++) {
      const expert = profiles[i];

      //Check if expert already exists in the database using author ID
      const existingExpert = await Expert.findOne({author_id: expert.author_id});

      if (existingExpert) {
        existingExpert = await Expert.findOneAndUpdate({author_id: expert.author_id}, {
          expert_id: expert.author_id,
          name: expert.name,
          field_of_study: query,
          institution: expert.affiliations,
          citations: expert.cited_by,
          hindex: 0,
          i10_index: 0,
        });
      }

      else {
        //Create a new expert
        const newExpert = new Expert({
          expert_id: expert.author_id,
          name: expert.name,
          field_of_study: query,
          institution: expert.affiliations,
          citations: expert.cited_by,
          hindex: 0,
          i10_index: 0
        });

        //Save the expert to the database
        await newExpert.save();
      }
      
      
      //Print status of which expert was added
      console.log('Expert added: ' + expert.name);
    }

    //Return message to the user
    res.status(200).json({ message: 'Experts added to database' });
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching experts from API' });
  }
}

module.exports = {
  /*
  getExperts,
  getExpert,
  */
  createExpert,
  deleteExpert,
  updateExpert,
  getUniqueFields,
  getUniqueInstitutions,
  getUniqueRegions,
  searchExperts,
  fetchExperts
};
