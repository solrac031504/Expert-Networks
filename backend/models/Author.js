const { DataTypes } = require('sequelize');
const sequelize = require ('../database');
const Institution = require('./Institution');

const Author = sequelize.define('Author', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true
  },
  display_name: {
    type: DataTypes.STRING,
    defaultValue: 'N/A',
    allowNull: false
  },
  works_count: {
    type: DataTypes.MEDIUMINT.UNSIGNED,
    defaultValue: 0,
    allowNull: false
  },
  cited_by_count: {
    type: DataTypes.MEDIUMINT.UNSIGNED,
    defaultValue: 0,
    allowNull: false
  },
  hindex: {
    type: DataTypes.SMALLINT.UNSIGNED,
    defaultValue: 0,
    allowNull: false
  },
  i_ten_index: {
    type: DataTypes.SMALLINT.UNSIGNED,
    defaultValue: 0,
    allowNull: false
  },
  impact_factor: {
    type: DataTypes.FLOAT.UNSIGNED,
    defaultValue: 0,
    allowNull: false
  },
  last_known_institution_id: {
    type: DataTypes.STRING,
    references: {
        model: Institution,
        key: 'institution_id',
    },
    allowNull: false,
    defaultValue: '000000'
  },
  works_count_2yr: {
    type: DataTypes.MEDIUMINT.UNSIGNED,
    defaultValue: 0,
    allowNull: false
  },
  cited_by_count_2yr: {
    type: DataTypes.MEDIUMINT.UNSIGNED,
    defaultValue: 0,
    allowNull: false
  },
  hindex_2yr: {
    type: DataTypes.SMALLINT.UNSIGNED,
    defaultValue: 0,
    allowNull: false
  },
  i_ten_index_2yr: {
    type: DataTypes.SMALLINT.UNSIGNED,
    defaultValue: 0,
    allowNull: false
  }
});

// Define associations
Author.belongsTo(Institution, { foreignKey: 'last_known_institution_id' });
Institution.hasMany(Author, { foreignKey: 'last_known_institution_id' });

module.exports = Author;
