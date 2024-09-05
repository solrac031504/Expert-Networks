const { DataTypes } = require('sequelize');
const sequelize = require ('../database');

const Topic = sequelize.define('Topic', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  display_name: {
    type: DataTypes.STRING
  },
  keywords: {
    type: DataTypes.TEXT
  },
  wikipedia_id: {
    type: DataTypes.STRING
  },
  domain_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  domain_display_name: {
    type: DataTypes.STRING
  },
  field_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  field_display_name: {
    type: DataTypes.STRING
  },
  subfield_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  subfield_display_name: {
    type: DataTypes.STRING
  }
}, { timestamps: false });

module.exports = Topic;
