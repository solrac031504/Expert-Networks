// import DB models
// const Expert = require('../models/Expert');
// const Institution = require('..models/Institution');
const TestExpert = require('../models/TestExpert');

const path = require('path');
const fs = require('fs');

const axios = require('axios'); //Import axios for http requests
const { query } = require('express');

require('dotenv').config(); //Import dotenv for environment variables

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
    // await Expert.deleteMany({});

    //Create or update experts in the database
    for (let i = 0; i < profiles.length; i++) {
      const expert = profiles[i];

      //Check if expert already exists in the database using author ID
      // const existingExpert = await Expert.findOne({author_id: expert.author_id});

      // if (existingExpert) {
      //   existingExpert = await Expert.findOneAndUpdate({author_id: expert.author_id}, {
      //     expert_id: expert.author_id,
      //     name: expert.name,
      //     field_of_study: query,
      //     institution: expert.affiliations,
      //     citations: expert.cited_by,
      //     hindex: 0,
      //     i10_index: 0,
      //   });
      // }

      // else {
      //   //Create a new expert
      //   const newExpert = new Expert({
      //     expert_id: expert.author_id,
      //     name: expert.name,
      //     field_of_study: query,
      //     institution: expert.affiliations,
      //     citations: expert.cited_by,
      //     hindex: 0,
      //     i10_index: 0
      //   });

      //   //Save the expert to the database
      //   await newExpert.save();
      // }

      // Check if expert exists and update if they do
      const newExpert = await TestExpert.findByPk(expert.author_id);
      
      if (newExpert == null) {
        await TestExpert.create({
          expert_id: expert.author_id,
          name: expert.name,
          field_of_study: query,
          institution: expert.affiliations,
          citations: expert.cited_by
        });
      }
      else {
        await newExpert.update(
          {
            expert_id: expert.author_id,
            name: expert.name,
            field_of_study: query,
            institution: expert.affiliations,
            citations: expert.cited_by
          }
        );
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
  fetchExperts
};
