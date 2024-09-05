const { DataTypes } = require('sequelize');
const sequelize = require ('../database');
const Field = require('./Field');

const Subfield = sequelize.define('Subfield', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    defaultValue: 'N/A'
  },
  field_id: {
    type: DataTypes.INTEGER,
    references: {
        model: Field,
        key: 'id'
    },
    allowNull: false
  }
}, { timestamps: false });

// Define associations
Subfield.belongsTo(Field, { foreignKey: 'field_id' });
Field.hasMany(Subfield, { foreignKey: 'field_id' });

module.exports = Subfield;