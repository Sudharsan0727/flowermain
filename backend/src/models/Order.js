const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  // Guest Information (collected if guest checkout)
  customer_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  customer_email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  customer_phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  discount_code: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'placed', // placed, confirmed, packed, shipped, delivered, cancelled
  },
  payment_method: {
    type: DataTypes.STRING, // COD, Online
    defaultValue: 'Online',
  },
  payment_status: {
    type: DataTypes.STRING,
    defaultValue: 'pending', // pending, paid, failed, refunded
  },
  payment_id: {
    type: DataTypes.STRING,
  },
  shipping_address: {
    type: DataTypes.TEXT,
  },
  shipping_city: {
    type: DataTypes.STRING,
  },
  shipping_zip: {
    type: DataTypes.STRING,
  },
  delivery_method: {
    type: DataTypes.STRING,
  },
  // Flower Shop Extras
  delivery_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  time_slot: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  gift_message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  occasion_type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  order_notes: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'orders',
  underscored: true,
  timestamps: true,
});

module.exports = Order;