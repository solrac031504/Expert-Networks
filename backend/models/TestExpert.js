const { DataTypes } = require('sequelize');
const sequelize = require ('../database');

const TestExpert = sequelize.define('TestExpert', {
  expert_id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'N/A'
  },
  field_of_study: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'N/A'
  },
  institution: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'N/A'
  },
  region: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'N/A'
  },
  citations: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  hindex: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  i_ten_index: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  impact_factor: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  years_in_field: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'N/A'
  }
});

module.exports = TestExpert;