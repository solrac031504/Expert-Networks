const { DataTypes } = require('sequelize');
const sequelize = require ('../database');

const Domain = sequelize.define('Domain', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  display_name: {
    type: DataTypes.STRING
  }
}, { timestamps: false });

module.exports = Domain;
