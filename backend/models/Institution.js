const { DataTypes } = require('sequelize');
const sequelize = require ('../database');

const Institution = sequelize.define('Institution', {
  institution_id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'N/A'
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'N/A'
  }
});

module.exports = Institution;