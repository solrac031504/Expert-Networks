const { DataTypes } = require('sequelize');
const sequelize = require ('../database');
const Field = require('./Field');

const Subfield = sequelize.define('Subfield', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  display_name: {
    type: DataTypes.STRING
  },
  field_id: {
    type: DataTypes.INTEGER,
    references: {
        model: Field,
        key: 'id'
    }
  }
}, { timestamps: false });

Subfield.belongsTo(Field, { foreignKey: 'field_id' });
Field.hasMany(Subfield, { foreignKey: 'field_id' });

module.exports = Subfield;
