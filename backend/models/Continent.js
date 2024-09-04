const { DataTypes } = require('sequelize');
const sequelize = require ('../database');

const Continent = sequelize.define('Continent', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    defaultValue: 'N/A'
  }
}, { timestamps: false });

module.exports = Continent;
