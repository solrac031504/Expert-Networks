const { DataTypes } = require('sequelize');
const sequelize = require ('../database');
const Institution = require('./Institution');

const Author = sequelize.define('Author', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true
  },
  display_name: {
    type: DataTypes.STRING
  },
  works_count: {
    type: DataTypes.MEDIUMINT.UNSIGNED,
    defaultValue: 0
  },
  cited_by_count: {
    type: DataTypes.MEDIUMINT.UNSIGNED,
    defaultValue: 0
  },
  hindex: {
    type: DataTypes.SMALLINT.UNSIGNED,
    defaultValue: 0
  },
  i_ten_index: {
    type: DataTypes.SMALLINT.UNSIGNED,
    defaultValue: 0
  },
  impact_factor: {
    type: DataTypes.FLOAT.UNSIGNED,
    defaultValue: 0
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
    defaultValue: 0
  },
  cited_by_count_2yr: {
    type: DataTypes.MEDIUMINT.UNSIGNED,
    defaultValue: 0
  },
  hindex_2yr: {
    type: DataTypes.SMALLINT.UNSIGNED,
    defaultValue: 0
  },
  i_ten_index_2yr: {
    type: DataTypes.SMALLINT.UNSIGNED,
    defaultValue: 0
  }
});

// Define associations
Author.belongsTo(Institution, { foreignKey: 'last_known_institution_id' });
Institution.hasMany(Author, { foreignKey: 'last_known_institution_id' });

module.exports = Author;
