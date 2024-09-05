const { DataTypes } = require('sequelize');
const sequelize = require ('../database');
const Region = require('./Region');

const Subregion = sequelize.define('Subregion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    defaultValue: 'N/A'
  },
  region_id: {
    type: DataTypes.INTEGER,
    references: {
        model: Region,
        key: 'id'
    },
    allowNull: false
  }
}, { timestamps: false });

// Define associations
Subregion.belongsTo(Region, { foreignKey: 'region_id' });
Region.hasMany(Subregion, { foreignKey: 'region_id' });

module.exports = Subregion;