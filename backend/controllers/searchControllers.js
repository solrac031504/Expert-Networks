const { Sequelize, Op, QueryTypes } = require('sequelize');

const redisClient = require('../redisClient');
const sequelize = require('../database');

require('dotenv').config(); //Import dotenv for environment variables

const arrToWhere = async(where_arr, institution_arr) => {
  if (where_arr.length === 0 && institution_arr.length === 0) return ''

  let result = 'WHERE';

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

  // if nothing is selected, return an empty array
  if (!(domain || field || subfield || topic || continent || region || subregion || country || institution)) return [];

  const cacheKey = JSON.stringify(queryParams);

  // Check if results are cached in Redis
  const cachedResults = await getCachedResults(cacheKey);

  if (cachedResults) {
    console.log('Returning cached result');
    return cachedResults;
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

  where_clause = await arrToWhere(where_arr, institutionArr);

  console.log("WHERE CLAUSE:\n", where_clause);

  let results;

  // If the last geographic filter selected was a subregion and there is no country
  // Inner join the subregion
  if (continent && region && subregion && !country) {
    results = await sequelize.query(`
      SELECT DISTINCT Authors.display_name AS 'author_name',
                  Institutions.name    AS 'institution_name',
                  Countries.name       AS 'country_name',
                  Authors.works_count,
                  Authors.cited_by_count,
                  Authors.hindex,
                  Authors.i_ten_index,
                  Authors.impact_factor
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
                    ON Fields.domain_id = Domains.id
      ${where_clause}
      LIMIT 100`,
      { type: QueryTypes.SELECT }
    );
  } else {
    results = await sequelize.query(`
      SELECT DISTINCT Authors.display_name AS 'author_name',
                  Institutions.name    AS 'institution_name',
                  Countries.name       AS 'country_name',
                  Authors.works_count,
                  Authors.cited_by_count,
                  Authors.hindex,
                  Authors.i_ten_index,
                  Authors.impact_factor
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
                    ON Fields.domain_id = Domains.id
      ${where_clause}
      LIMIT 100`,
      { type: QueryTypes.SELECT }
    );
  }

  // Cache the result in Redis
  // key, value, expiration in seconds, seconds
  redisClient.set(cacheKey, JSON.stringify(results), 'EX', 600); // Cache for 10 min

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
