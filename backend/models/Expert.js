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
<<<<<<< HEAD
    defaultValue: '000000'
=======
    defaultValue: 'N/A'
>>>>>>> 94cb9d296ed8a35ec87240d5a6d952be8e6e08b1
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
    type: DataTypes.FLOAT,
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

// Define associations
Expert.belongsTo(Institution, { foreignKey: 'institution_id' });
Institution.hasMany(Expert, { foreignKey: 'institution_id' });

module.exports = Expert;
