// import DB models
const Expert = require('../models/Expert');
// const Institution = require('..models/Institution');

// Test
const TestExpert = require('../models/TestExpert');

const path = require('path');
const fs = require('fs');

const axios = require('axios'); // Import axios for HTTP requests
const { query } = require('express');
const sequelize = require('../database');

require('dotenv').config(); // Import dotenv for environment variables

// Fetch for experts
const fetchExperts = async (req, res) => {
  // Topics to search for
  const topics = [
    'Semantics',
    'Artificial Intelligence',
    'Machine Learning',
    'National Security',
    'Cybersecurity',
    'Quantum Computing',
    'Hypersonics',
    'Semiconductors',
    'Biotechnology',
    'Economics'
  ];

  const API_KEY = process.env.SERPAPI_KEYK;
  const initialURL = process.env.GOOGLE_SCHOLAR_PROFILES;
  const profilesNeeded = 100;

  let allProfiles = [];

  try {
    for (const topic of topics) {
      let profiles = [];
      let pageToken = null;

      // While loop to fetch all profiles
      while (profiles.length < profilesNeeded) {
        // Fetch data from the API
        const params = {
          engine: "google_scholar_profiles",
          api_key: API_KEY,
          mauthors: topic,
          ...(pageToken && { after_author: pageToken })
        };

        const { data } = await axios.get(initialURL, { params });

        // Append data to profiles array
        profiles = profiles.concat(data.profiles);

        // Check if there is a next page
        if (data.pagination && data.pagination.next_page_token) {
          pageToken = data.pagination.next_page_token;
        } else {
          break;
        }
      }

      // Append fetched profiles to allProfiles
      // allProfiles = allProfiles.concat(profiles);

      // Create or update experts in the database for the current topic
      for (const profile of profiles) {
        const expert = profile;

        // Check if expert already exists in the database using author ID
        let existingExpert = await Expert.findByPk(expert.author_id);

        // Fetch institution data from OpenAlex by author name
        const openAlexUrl = `https://api.openalex.org/authors?search=${encodeURIComponent(expert.name)}`;

        let institutionData;
        try {
          const openAlexResponse = await axios.get(openAlexUrl);

          const authorData = openAlexResponse.data.results.find(author => author.display_name === expert.name);

          // Get institution data from OpenAlex
          if (authorData && authorData.affiliations && authorData.affiliations.length > 0) {
            institutionData = authorData.affiliations[0].institution.ror;
          } else {
            institutionData = "000000";
          }

          // Get h-index from OpenAlex
          if (authorData && authorData.summary_stats && authorData.summary_stats.h_index) {
            expert.hindex = authorData.summary_stats.h_index;
          }

          // Get i10-index from OpenAlex
          if (authorData && authorData.summary_stats && authorData.summary_stats.i10_index) {
            expert.i_ten_index = authorData.summary_stats.i10_index;
          }

          // Get impact factor (2yr_mean_citedness) from OpenAlex
          if (authorData && authorData.summary_stats && authorData.summary_stats['2yr_mean_citedness']) {
            expert.impact_factor = authorData.summary_stats['2yr_mean_citedness'];
          }
        } catch (error) {
          institutionData = '000000';
        }

        // If expert does not exist, create a new expert
        if (!existingExpert) {
          existingExpert = await Expert.create({
            expert_id: expert.author_id,
            name: expert.name,
            field_of_study: topic,
            institution_id: institutionData,
            citations: (expert.cited_by === null) ? 0 : expert.cited_by,
            hindex: expert.hindex,
            i_ten_index: expert.i_ten_index,
            impact_factor: expert.impact_factor,
            email: expert.email
          });
        } else {
          await existingExpert.update({
            expert_id: expert.author_id,
            name: expert.name,
            field_of_study: topic,
            institution_id: institutionData,
            citations: (expert.cited_by === null) ? 0 : expert.cited_by,
            hindex: expert.hindex,
            i_ten_index: expert.i_ten_index,
            impact_factor: expert.impact_factor,
            email: expert.email
          });
        }
      }
    }

    // Print data for debugging
    // console.log(allProfiles);

    // Return message to the user
    res.status(200).json({ message: 'Experts added to database' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching experts from API' });
  }
};

module.exports = {
  fetchExperts
};
