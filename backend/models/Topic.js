const { DataTypes } = require('sequelize');
const sequelize = require ('../database');

const Subfield = require('./Subfield');

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
  subfield_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Subfield,
      key: 'id'
    },
    allowNull: false
  }
}, { timestamps: false });

Topic.belongsTo(Subfield, { foreignKey: 'subfield_id' });
Subfield.hasMany(Topic, { foreignKey: 'subfield_id' });

module.exports = Topic;
