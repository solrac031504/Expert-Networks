const { DataTypes } = require('sequelize');
const sequelize = require ('../database');
const Continent = require('./Continent');

const Region = sequelize.define('Region', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    defaultValue: 'N/A'
  },
  continent_id: {
    type: DataTypes.INTEGER,
    references: {
        model: Continent,
        key: 'id'
    },
    allowNull: false
  }
}, { timestamps: false });

// Define associations
Region.belongsTo(Continent, { foreignKey: 'continent_id' });
Continent.hasMany(Region, { foreignKey: 'continent_id' });

module.exports = Region;
