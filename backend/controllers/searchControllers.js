const { Sequelize, Op, QueryTypes } = require('sequelize');

const redisClient = require('../redisClient');
const sequelize = require('../database');
const { is } = require('express/lib/request');

require('dotenv').config(); //Import dotenv for environment variables

const arrToWhere = async(where_arr, institution_arr, last_author_id) => {
  if (where_arr.length === 0 && institution_arr.length === 0) return ''

  let result = `WHERE author_id > ${last_author_id} AND `;

  for (let i = 0; i < where_arr.length; i++) {
    result = result.concat(' ', where_arr[i]);

    // Append an AND if there are remaining values in the first array OR if there are values in the institution_arr
    if (i + 1 < where_arr.length || institution_arr.length !== 0) result = result.concat(' ', 'AND');
  }

  if (institution_arr.length !== 0) {
    result = result.concat(' ', '(');

    for (let i = 0; i < institution_arr.length; i++) {
      conditions = `LOWER(Institutions.name) LIKE '%${institution_arr[i]}%' OR
                    LOWER(Institutions.acronym) LIKE '%${institution_arr[i]}%' OR
                    LOWER(Institutions.alias) LIKE '%${institution_arr[i]}%' OR
                    LOWER(Institutions.label) LIKE '%${institution_arr[i]}%'`;

      result = result.concat(conditions);

      if (i + 1 < institution_arr.length) result = result.concat(' ', 'OR', ' ')
    }

    result = result.concat(')');
  }

  return result;
};

async function getCachedResults(cacheKey) {
  try {
    const cachedData = await redisClient.get(cacheKey);
    return cachedData ? JSON.parse(cachedData) : null;
  } catch (err) {
    console.error('Error fetching from Redis:', err);
    return null;
  }
}

const fetchExperts = async(queryParams) => {
  // process searches in increments of 100  
  // Use the id of the last author to start from there
  // Find the next 100 authors
  const batch_size = 100;
  let last_author_id = 0;

  // Get the query parameters
  // These are id
  const {
    domain,
    field,
    subfield,
    topic,
    continent,
    region,
    subregion,
    country,
    institution
  } = queryParams;

  let {
    limit = 100,
    ...modifiedQueryParams
  } = queryParams;
  
  // If limit is not a valid number, set it to 100
  if (isNaN(limit)) {
    limit = 100;
  }

  // Define the two main queries used
  // Inner join is used when a subregion is selected to prevent countries with no subreion from being excluded
  // When no subregion is selected
  const query_with_inner_join_subregion = `
      SELECT DISTINCT Authors.id AS 'author_id',
                  Authors.display_name AS 'author_name',
                  Institutions.name    AS 'institution_name',
                  Countries.name       AS 'country_name',
                  Authors.works_count,
                  Authors.cited_by_count,
                  Authors.hindex,
                  Authors.i_ten_index,
                  Authors.impact_factor,
                  Countries.is_global_south
      FROM   Authors
            INNER JOIN Institutions
                    ON Authors.last_known_institution_id =
                        Institutions.institution_id
            INNER JOIN Countries
                    ON Institutions.country_code = Countries.alpha2
            INNER JOIN Subregions
                    ON Countries.subregion_id = Subregions.id
            INNER JOIN Regions
                    ON Subregions.region_id = Regions.id
            INNER JOIN Continents
                    ON Regions.continent_id = Continents.id
            INNER JOIN AuthorTopics
                    ON Authors.id = AuthorTopics.author_id
            INNER JOIN Topics
                    ON AuthorTopics.topic_id = Topics.id
            INNER JOIN Subfields
                    ON Topics.subfield_id = Subfields.id
            INNER JOIN Fields
                    ON Subfields.field_id = Fields.id
            INNER JOIN Domains
                    ON Fields.domain_id = Domains.id`;

const query_with_left_join_subregion = `
      SELECT DISTINCT Authors.id AS 'author_id',
                  Authors.display_name AS 'author_name',
                  Institutions.name    AS 'institution_name',
                  Countries.name       AS 'country_name',
                  Authors.works_count,
                  Authors.cited_by_count,
                  Authors.hindex,
                  Authors.i_ten_index,
                  Authors.impact_factor,
                  Countries.is_global_south
      FROM   Authors
            INNER JOIN Institutions
                    ON Authors.last_known_institution_id =
                        Institutions.institution_id
            INNER JOIN Countries
                    ON Institutions.country_code = Countries.alpha2
            LEFT JOIN Subregions
                    ON Countries.subregion_id = Subregions.id
            INNER JOIN Regions
                    ON Countries.region_id = Regions.id
            INNER JOIN Continents
                    ON Regions.continent_id = Continents.id
            INNER JOIN AuthorTopics
                    ON Authors.id = AuthorTopics.author_id
            INNER JOIN Topics
                    ON AuthorTopics.topic_id = Topics.id
            INNER JOIN Subfields
                    ON Topics.subfield_id = Subfields.id
            INNER JOIN Fields
                    ON Subfields.field_id = Fields.id
            INNER JOIN Domains
                    ON Fields.domain_id = Domains.id`;

  // if nothing is selected, return an empty array
  if (!(domain || field || subfield || topic || continent || region || subregion || country || institution)) return [];

  // Modified query params excludes the limit and last_author_id
  const cacheKey = JSON.stringify(modifiedQueryParams);

  // Check if results are cached in Redis
  const cachedResults = await getCachedResults(cacheKey);

  if (cachedResults) {
    console.log(`Returning cached result with ${cachedResults.length} authors`);

    // If the there are at least as many records in the cached results as the limit
    // Return the cached results
    // Let the frontend truncate the rest of the authors
    if (cachedResults.length >= limit) {
      return cachedResults;
    } else {
      // Otherwise, find the id of the last author and mark that as
      // last_author_id
      // Then, let the search find the next 100 authors and append that to the cachedResults
      last_author_id = cachedResults.slice(-1)[0].author_id;
    }
  }

  let where_clause;
  let where_arr = [];
  let institutionArr = [];

  if (domain) where_arr.push(`Domains.id=${domain}`);
  if (field) where_arr.push(`Fields.id=${field}`);
  if (subfield) where_arr.push(`Subfields.id=${subfield}`);
  if (topic) where_arr.push(`Topics.id=${topic}`);
  if (continent) where_arr.push(`Continents.id=${continent}`);
  if (region) where_arr.push(`Regions.id=${region}`);
  if (subregion) where_arr.push(`Subregions.id=${subregion}`);
  if (country) where_arr.push(`Countries.id=${country}`);

  if (institution) institutionArr = institution.split(',').map(item => item.trim());

  where_clause = await arrToWhere(where_arr, institutionArr, last_author_id);

  let results;

  // If the last geographic filter selected was a subregion and there is no country
  // Inner join the subregion
  if (continent && region && subregion && !country) {
    // console.log(`
    //   ${query_with_inner_join_subregion}
    //   ${where_clause}
    //   LIMIT 100`);

    results = await sequelize.query(`
      ${query_with_inner_join_subregion}
      ${where_clause}
      LIMIT ${batch_size}`,
      { type: QueryTypes.SELECT }
    );
  } else {
    // console.log(`
    //   ${query_with_left_join_subregion}
    //   ${where_clause}
    //   LIMIT 100`);

    results = await sequelize.query(`
      ${query_with_left_join_subregion}
      ${where_clause}
      LIMIT ${batch_size}`,
      { type: QueryTypes.SELECT }
    );
  }

  // If there were cached results,
  // Append the current results to the cached results
  // Then assign the value back to results
  if (cachedResults) {
    let finalResults = [];
    finalResults = cachedResults.concat(results);
    results = finalResults;
  }

  console.log(`Retrieved ${results.length} authors`);
  
  // If there are at least 5000 results, cache the data permanently
  if (results.length >= 5000) {
    redisClient.set(cacheKey, JSON.stringify(results));
    console.log(`Caching results with no expiration time`);
  } else {
    // If there are less than 5000 results, cache the data for 10 minutes
    // key, value, expiration in seconds
    // redisClient.set(cacheKey, JSON.stringify(results), 'EX', 600); // Cache for 10 min
    redisClient.set(cacheKey, JSON.stringify(results), { EX: 600 });
    console.log(`Caching results for 10 minutes (600 sec).`);
  }

  return results;
};

// search experts with query parameters
const searchExperts = async (req, res) => {
  try {
    const results = await fetchExperts(req.query);
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  searchExperts,
  fetchExperts
};
