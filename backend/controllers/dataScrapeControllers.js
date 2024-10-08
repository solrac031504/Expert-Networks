// import DB models
const Expert = require('../models/Expert');
// const Institution = require('..models/Institution');
const Author = require('../models/Author');
const Topic = require('../models/Topic');
const AuthorTopic = require('../models/AuthorTopic');

const path = require('path');
const fs = require('fs');

const axios = require('axios'); // Import axios for HTTP requests
const { query } = require('express');
const sequelize = require('../database');

require('dotenv').config(); // Import dotenv for environment variables

const { extractTopicID } = require('../controllers/csvImportControllers');

// All author ID follow the pattern https://openalex.org/T##### https://openalex.org/authors/A##########
// Only want the ########## for faster indexing
const extractAuthorID = (raw_id) => {
  const match = raw_id.match(/A(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

// Fetch for experts
// DO NOT USE, WILL REMOVE. DOES NOT WORK FOR ALL AUTHORS, ONLY RETRIEVES 25 AND HAVE A LIMIT TO 100,000 API CALLS PER DAY PER USER
// USE THE CSV IMPORT. WILL TAKE CARE OF BOTH AUTHORS AND THE AUTHOR TOPICS
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

// Import the authors from OpenAlex using the API link
const importExpertsOA = async(req, res) => {
  try {
    let authors = [];
  const authorURL = 'https://api.openalex.org/authors';

  const { data } = await axios.get(authorURL);

  // Holds all of the authors from OpenAlex
  authors = data.results;
  console.log("Number of authors returned:", data.results.length);

  let i = 0;
  for (const record of authors) {
    const { 
      id,
      display_name,
      works_count, 
      cited_by_count,
      summary_stats,
      last_known_institutions,
      topics,
      updated_date,
      created_date
    } = record;

    let adjusted_id = extractAuthorID(id);

    // console.log("id:", id);
    // console.log("adjusted_id:", adjusted_id);
    // console.log("display_name:", display_name);
    // console.log("works_count:", works_count);
    // console.log("cited_by_count:", cited_by_count);
    // console.log("summary_stats:", summary_stats);
    // console.log("last_known_institutions:", last_known_institutions);
    // console.log("topics:", topics);
    // console.log("updated_date:", updated_date);
    // console.log("created_date:", created_date);

    let existingAuthor = await Author.findByPk(adjusted_id);

    // If existingAuthor is null, then create
    // Reassign existingAuthor so that it can be used in the topics loop
    if (!existingAuthor) {
      existingAuthor = await Author.create({
        id: adjusted_id,
        display_name: display_name,
        works_count: works_count,
        cited_by_count: cited_by_count,
        hindex: summary_stats.h_index,
        i_ten_index: summary_stats.i10_index,
        impact_factor: summary_stats['2yr_mean_citedness'],
        last_known_institution_id: last_known_institutions.ror,
        works_count_2yr: summary_stats['2yr_works_count'],
        cited_by_count_2yr: summary_stats['2yr_cited_by_count'],
        hindex_2yr: summary_stats['2yr_h_index'],
        i_ten_index: summary_stats['2yr_i10_index']
      });
    } else {
      existingAuthor = await existingAuthor.update({
        id: adjusted_id,
        display_name: display_name,
        works_count: works_count,
        cited_by_count: cited_by_count,
        hindex: summary_stats.h_index,
        i_ten_index: summary_stats.i10_index,
        impact_factor: summary_stats['2yr_mean_citedness'],
        last_known_institution_id: last_known_institutions.ror,
        works_count_2yr: summary_stats['2yr_works_count'],
        cited_by_count_2yr: summary_stats['2yr_cited_by_count'],
        hindex_2yr: summary_stats['2yr_h_index'],
        i_ten_index: summary_stats['2yr_i10_index']
      });
    }

    // For each topic,
    // Find the topic using the PK
    // Add that topic to the author
    // That topic gets added to the table AuthorTopics
    for (const topic of topics) {
      let adjustedTopicID = extractTopicID(topic.id);
      const retrievedTopic = await Topic.findByPk(adjustedTopicID);

      // The result of a (author_id, topic_id) search
      const tuple = await AuthorTopic.findOne({
        where: {
          author_id: existingAuthor.id,
          topic_id: retrievedTopic.id
        }
      });

      // The topic will be added to the author only if the topic did not already exist for that author
      if (!tuple) await existingAuthor.addTopic(retrievedTopic);
    }

    break;
  }

  res.status(200).json({ message: 'Experts added to database' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching experts from API' });
  }
}

module.exports = {
  fetchExperts,
  importExpertsOA
};
