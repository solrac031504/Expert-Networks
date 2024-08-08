const { DataTypes } = require('sequelize');
const sequelize = require ('../database');
const Institution = require('./Institution');

const Expert = sequelize.define('Expert', {
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
  institution_id: {
    type: DataTypes.STRING,
    references: {
      model: Institution,
      key: 'institution_id',
    },
    allowNull: false,
    defaultValue: '000000'
  },
  citations: {
    type: DataTypes.MEDIUMINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0
  },
  hindex: {
    type: DataTypes.SMALLINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
  },
  i_ten_index: {
    type: DataTypes.SMALLINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0
  },
  impact_factor: {
    type: DataTypes.FLOAT.UNSIGNED,
    allowNull: false,
    defaultValue: 0
  },
  age: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0
  },
  years_in_field: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'N/A'
  }
});

// Define associations
Expert.belongsTo(Institution, { foreignKey: 'institution_id' });
Institution.hasMany(Expert, { foreignKey: 'institution_id' });

module.exports = Expert;
