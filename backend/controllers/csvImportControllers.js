// import DB models
const Institution = require('../models/Institution');

const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');


const axios = require('axios'); //Import axios for http requests
const { query } = require('express');
const sequelize = require('../database');

require('dotenv').config(); //Import dotenv for environment variables

const importTopicsCSV = async (req, res) => {
    
}

module.exports = {
  importTopicsCSV
};
