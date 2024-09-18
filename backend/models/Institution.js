const { DataTypes } = require('sequelize');
const sequelize = require ('../database');
const Country = require('./Country');

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
  acronym: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'N/A'
  },
  alias: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: 'N/A'
  },
  label: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: 'N/A'
  },
  country_code: {
    type: DataTypes.STRING(2),
    references: {
      model: Country,
      key: 'alpha2'
    }
  },
  status: {
    type: DataTypes.STRING
  },
  types: {
    type: DataTypes.STRING
  }
});

Institution.belongsTo(Country, { foreignKey: 'country_code', targetKey: 'alpha2' });
Country.hasMany(Institution, { foreignKey: 'country_code' });

module.exports = Institution;