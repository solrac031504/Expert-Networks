const { DataTypes } = require('sequelize');
const sequelize = require ('../database');
const Domain = require('./Domain');

const Field = sequelize.define('Field', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  display_name: {
    type: DataTypes.STRING
  },
  domain_id: {
    type: DataTypes.INTEGER,
    references: {
        model: Domain,
        key: 'id'
    },
    allowNull: false
  }
}, { timestamps: false });

Field.belongsTo(Domain, { foreignKey: 'domain_id' });
Domain.hasMany(Field, { foreignKey: 'domain_id' });

module.exports = Field;
