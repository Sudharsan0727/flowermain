const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DeliveryArea = sequelize.define('DeliveryArea', {
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  zip_codes: {
    type: DataTypes.TEXT, // Stored as comma-separated values
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Active',
  },
  position: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }
}, {
  tableName: 'delivery_areas',
  underscored: true,
  timestamps: true,
});

module.exports = DeliveryArea;
