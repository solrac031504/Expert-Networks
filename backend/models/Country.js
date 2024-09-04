const { DataTypes } = require('sequelize');
const sequelize = require ('../database');
const Continent = require('./Continent');
const Region = require('./Region');
const Subregion = require('./Subregion');

const Country = sequelize.define('Country', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
  },
  official_name: {
    type: DataTypes.STRING,
  },
  alias: {
    type: DataTypes.STRING,
  },
  alpha2: {
    type: DataTypes.STRING(2),
    unique: true
  },
  alpha3: {
    type: DataTypes.STRING(3),
    unique: true
  },
  is_global_south: {
    type: DataTypes.BOOLEAN
  },
  continent_id: {
    type: DataTypes.INTEGER,
    references: {
        model: Continent,
        key: 'id'
    },
    allowNull: false
  },
  region_id: {
    type: DataTypes.INTEGER,
    references: {
        model: Region,
        key: 'id'
    },
    allowNull: false
  },
  subregion_id: {
    type: DataTypes.INTEGER,
    references: {
        model: Subregion,
        key: 'id'
    },
    allowNull: true
  }
}, { timestamps: false });

// Define associations
Country.belongsTo(Continent, { foreignKey: 'continent_id' });
Continent.hasMany(Country, { foreignKey: 'continent_id' });

Country.belongsTo(Region, { foreignKey: 'region_id' });
Region.hasMany(Country, { foreignKey: 'region_id' });

Country.belongsTo(Subregion, { foreignKey: 'subregion_id' });
Subregion.hasMany(Country, { foreignKey: 'subregion_id' });

module.exports = Country;
