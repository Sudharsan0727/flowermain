const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const jwt = require('jsonwebtoken');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Setting = require('../models/Setting');
const auth = require('../middleware/auth');
const sequelize = require('../config/database');
const { Op } = require('sequelize');
const CustomerAddress = require('../models/CustomerAddress');
const Discount = require('../models/Discount');
const DiscountUsage = require('../models/DiscountUsage');

const { verifyAdmin } = require('../middleware/adminAuth');
const bcrypt = require('bcryptjs');
const { sendOrderConfirmation } = require('../utils/mailer');

// Place Order & Reduce Stock (Supports both Guest and Logged-in)
router.post('/place', auth, async (req, res) => {
  const {
    items,
    totalAmount,
    paymentMethod,
    paymentId,
    customerInfo,
    shippingAddress,
    deliveryMethod,
    deliveryDate,
    timeSlot,
    giftMessage,
    occasionType,
    orderNotes,
    sessionId,
    discountId,
    discountAmount: appliedDiscountAmount
  } = req.body;

  // Identify Customer from Authentication Middleware
  let userId = req.user ? req.user.id : null;

  // Verify Identity (Handle stale tokens from environment transitions)
  if (userId) {
    try {
      const numericUserId = parseInt(userId);
      if (!isNaN(numericUserId)) {
        const exists = await Customer.findByPk(numericUserId);
        if (!exists) {
          console.warn(`[Order API] Stale Identity detected: ${userId}. Reverting to guest protocol.`);
          userId = null;
        }
      }
    } catch (err) {
      console.error(`[Order API] Identity check failure:`, err);
      userId = null;
    }
  }

  const transaction = await sequelize.transaction();

  try {
    if (!items || items.length === 0) {
      throw new Error("No botanical items detected in your registry.");
    }


    // 0. Daily Order Limit Check
    const settingLimit = await Setting.findOne({ where: { key: 'daily_order_limit' } });
    const limit = settingLimit ? parseInt(settingLimit.value) : 0;

    if (limit > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const orderCount = await Order.count({
        where: {
          createdAt: {
            [Op.gte]: today,
            [Op.lt]: tomorrow
          },
          status: { [Op.ne]: 'cancelled' }
        }
      });

      if (orderCount >= limit) {
        throw new Error("the shop today order limit reached");
      }
    }


    // Data Normalization
    const normalizedPaymentMethod = paymentMethod?.toUpperCase() === 'COD' ? 'COD' : 'Online';
    const normalizedDeliveryDate = (deliveryDate && deliveryDate !== '' && deliveryDate !== 'Invalid date') ? deliveryDate : null;

    if (normalizedDeliveryDate) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;
      
      if (normalizedDeliveryDate < todayStr) {
        throw new Error("We don't allow delivery on previous dates. Please select a current or future date.");
      }

      const selDate = new Date(normalizedDeliveryDate);
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayName = dayNames[selDate.getDay()];
      
      const AtelierHour = require('../models/AtelierHour');
      const atelierHour = await AtelierHour.findOne({ where: { day: dayName } });
      
      if (atelierHour && atelierHour.isClosed) {
        throw new Error(`The shop is closed on ${dayName}s. Please choose another date.`);
      }

      const disabledDatesSetting = await Setting.findOne({ where: { key: 'disabled_delivery_dates' } });
      if (disabledDatesSetting && disabledDatesSetting.value) {
        const disabledDates = disabledDatesSetting.value.split(',').map(d => {
          const t = d.trim();
          if (/^\d{2}-\d{2}-\d{4}$/.test(t)) {
            const [dd, mm, yyyy] = t.split('-');
            return `${yyyy}-${mm}-${dd}`;
          }
          return t;
        });
        if (disabledDates.includes(normalizedDeliveryDate)) {
          throw new Error("The shop is closed on the selected date. Please select another date.");
        }
      }
    }

    console.log(`[Order API] Processing order for ${userId ? 'User ' + userId : 'Guest'}. Payment: ${normalizedPaymentMethod}`);

    // 1. Stock Validation & Price Locking
    let calculatedTotal = 0;
    for (const item of items) {
      const product = await Product.findByPk(item.id, { transaction });
      if (!product) {
        throw new Error(`Archived specimen #${item.id} no longer exists.`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Insufficent stock for '${product.name}'. Remaining: ${product.stock}`);
      }

      const priceVal = parseFloat(product.price.toString().replace(/[^0-9.]/g, '')) || 0;
      let itemExtra = 0;
      if (item.options?.chocolates) {
        const match = item.options.chocolates.match(/\+(\d+\.\d+)/);
        if (match) itemExtra += parseFloat(match[1]);
      }
      if (item.options?.stuffedAnimal) {
        const match = item.options.stuffedAnimal.match(/\+(\d+\.\d+)/);
        if (match) itemExtra += parseFloat(match[1]);
      }
      calculatedTotal += (priceVal + itemExtra) * item.quantity;
    }

    const shipping = deliveryMethod === 'pickup' ? 0 : (calculatedTotal > 99 ? 0 : 15);
    const tax = calculatedTotal * 0.08;
     // Validate discount again if provided
    let discountAmount = 0;
    let discountCode = null;
    let discountRecord = null;

    if (discountId) {
      discountRecord = await Discount.findByPk(discountId, { transaction });
      if (discountRecord && discountRecord.status === 'active') {
        // Simple re-validation of amount (you could do more complex here)
        discountAmount = parseFloat(appliedDiscountAmount) || 0;
        discountCode = discountRecord.code;
      }
    }

    const finalTotal = calculatedTotal + shipping + tax - discountAmount;

    const custName = customerInfo?.name || req.body.name || (req.body.firstName ? `${req.body.firstName} ${req.body.lastName || ''}` : null);
    const custEmail = customerInfo?.email || req.body.email || null;
    const custPhone = customerInfo?.phone || req.body.phone || null;

    // 2. Find or Create Customer record (for Guest Support)
    let finalCustomerId = userId;
    let isNewCustomer = false;
    console.log(`[Order API] Initial Identity: ${userId}`);

    if (!finalCustomerId && custEmail) {
      try {
        console.log(`[Order API] Converting Guest to Registered Customer: ${custEmail}`);
        
        // Hash the default password for security
        const hashedPassword = await bcrypt.hash('BotanicalGuest123!', 10);

        // Use findOrCreate to ensure we have a Customer record
        const [customerRecord, created] = await Customer.findOrCreate({
          where: { email: custEmail },
          defaults: {
            first_name: req.body.firstName || custName?.split(' ')[0] || 'Guest',
            last_name: req.body.lastName || custName?.split(' ').slice(1).join(' ') || 'User',
            phone: custPhone,
            is_verified: true, // Mark as verified since they just completed a purchase
            password: hashedPassword // Securely hashed default password
          },
          transaction
        });

        finalCustomerId = customerRecord.id;
        isNewCustomer = created;
        console.log(`[Order API] ${created ? 'New Customer Created' : 'Existing Customer Found'}: ID=${finalCustomerId}`);
        
        // If customer existed but was missing data, update it now
        if (!created) {
          await customerRecord.update({
            first_name: customerRecord.first_name || req.body.firstName || custName?.split(' ')[0],
            last_name: customerRecord.last_name || req.body.lastName || custName?.split(' ').slice(1).join(' '),
            phone: customerRecord.phone || custPhone
          }, { transaction });
        }
      } catch (custErr) {
        console.error("[Order API] Guest conversion failed:", custErr);
        // We don't throw here to avoid failing the order, but we log the failure
      }
    }

    console.log(`[Order API] Final Customer ID for Order: ${finalCustomerId}`);

    // 2.5 Archive Shipping Address as Landmark if requested or if new customer
    if (finalCustomerId && shippingAddress && shippingAddress.address) {
      console.log(`[Order API] Attempting to archive landmark for customer: ${finalCustomerId}`);
      try {
        const addrCount = await CustomerAddress.count({ where: { customer_id: finalCustomerId }, transaction });
        console.log(`[Order API] Current landmark count for user: ${addrCount}`);
        
        // We use findOrCreate to avoid duplicate landmarks for the same physical location
        const [addressRecord, createdAddr] = await CustomerAddress.findOrCreate({
          where: {
            customer_id: finalCustomerId,
            street: shippingAddress.address,
            city: shippingAddress.city || '',
            zip: shippingAddress.zip || ''
          },
          defaults: {
            title: 'Recent Delivery',
            first_name: req.body.firstName || custName?.split(' ')[0],
            last_name: req.body.lastName || custName?.split(' ').slice(1).join(' '),
            state: shippingAddress.state || '',
            phone: custPhone || '',
            is_default: addrCount === 0 // Make it default if it's their first landmark
          },
          transaction
        });
        
        if (createdAddr) {
          console.log(`[Order API] SUCCESS: Archived new landmark ${addressRecord.id} for customer ${finalCustomerId}`);
        } else {
          console.log(`[Order API] Landmark already exists (ID: ${addressRecord.id}) for customer ${finalCustomerId}`);
        }
      } catch (addrErr) {
        console.error("[Order API] FAILURE: Could not archive address landmark:", addrErr);
      }
    } else {
      console.log(`[Order API] Skipping landmark archival. Data: CustomerID=${finalCustomerId}, Address=${shippingAddress?.address}`);
    }

    // 3. Create Order dossier
    const order = await Order.create({
      customer_id: finalCustomerId,
      customer_name: custName,
      customer_email: custEmail,
      customer_phone: custPhone,
      total_amount: finalTotal,
      payment_method: normalizedPaymentMethod,
      payment_status: normalizedPaymentMethod === 'COD' ? 'pending' : (paymentId ? 'paid' : 'pending'),
      payment_id: paymentId,
      shipping_address: shippingAddress?.address,
      shipping_city: shippingAddress?.city,
      shipping_zip: shippingAddress?.zip,
      delivery_method: deliveryMethod,
      delivery_date: normalizedDeliveryDate,
      time_slot: timeSlot,
      gift_message: giftMessage,
      occasion_type: occasionType,
      order_notes: orderNotes,
      status: 'placed',
      discount_amount: discountAmount,
      discount_code: discountCode
    }, { transaction });

  // 4. Record Discount Usage
    if (discountRecord) {
      await DiscountUsage.create({
        discount_id: discountRecord.id,
        customer_id: finalCustomerId,
        customer_email: custEmail,
        order_id: order.id
      }, { transaction });

      await discountRecord.increment('used_count', { transaction });
    }
    
    // 3. Create OrderItems & Reduce Stock
    for (const item of items) {
      const product = await Product.findByPk(item.id, { transaction });

      await OrderItem.create({
        order_id: order.id,
        product_id: item.id,
        name: item.name,
        price: parseFloat(product.price.toString().replace(/[^0-9.]/g, '')) || 0,
        quantity: item.quantity,
        options: item.options,
        image: item.image
      }, { transaction });

      await product.update({ stock: product.stock - item.quantity }, { transaction });
      
      // Update item price in the array for email summary
      item.price = parseFloat(product.price.toString().replace(/[^0-9.]/g, '')) || 0;
    }

    if (userId || sessionId) {
      const cartWhere = userId ? { customer_id: userId, status: 'active' } : { session_id: sessionId, status: 'active' };
      const cart = await Cart.findOne({ where: cartWhere, transaction });
      if (cart) {
        await CartItem.destroy({ where: { cart_id: cart.id }, transaction });
      }
    }

    await transaction.commit();

    // 5. Send confirmation email (Async)
    try {
      const fullCustomer = await Customer.findByPk(finalCustomerId);
      if (fullCustomer) {
        sendOrderConfirmation(order, fullCustomer, items, isNewCustomer);
      }
    } catch (emailErr) {
      console.error("[Order API] Email trigger failed:", emailErr);
    }

    // Establish session for the reconciled customer if they were a guest
    if (!userId && finalCustomerId) {
      const customer = await Customer.findByPk(finalCustomerId);
      if (customer) {
        const token = jwt.sign(
          { id: customer.id, role: 'customer' },
          process.env.JWT_SECRET || 'supersecretkey',
          { expiresIn: '7d' }
        );

        res.cookie('customer_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(201).json({
          message: 'Order archived successfully',
          orderId: order.id,
          total: finalTotal,
          token: token,
          customer: {
            id: customer.id,
            email: customer.email,
            first_name: customer.first_name,
            last_name: customer.last_name
          }
        });
      }
    }

    res.status(201).json({
      message: 'Order archived successfully',
      orderId: order.id,
      total: finalTotal
    });

  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error('[Order API] CLINICAL FAILURE:', {
      message: error.message,
      stack: error.stack,
      payload: req.body
    });
    res.status(500).json({
      message: 'Order Processing Failed',
      error: error.message,
      tip: 'Check if all specimens are in stock and delivery date is valid.'
    });
  }
});

// ADMIN ROUTES
// Get all orders with filters
router.get('/admin/all', verifyAdmin, async (req, res) => {
  const { status, dateFrom, dateTo } = req.query;
  const where = {};

  if (status && status !== 'all') where.status = status;
  if (dateFrom || dateTo) {
    where.created_at = {};
    if (dateFrom) where.created_at[Op.gte] = new Date(dateFrom);
    if (dateTo) where.created_at[Op.lte] = new Date(dateTo);
  }

  try {
    const orders = await Order.findAll({
      where,
      include: [{ model: OrderItem, as: 'items' }],
      order: [['created_at', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Update order status
router.patch('/admin/:id/status', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    await order.update({ status });
    res.json({ message: `Order status updated to ${status}`, order });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status' });
  }
});

// Get User's Orders
router.get('/my-orders', auth, async (req, res) => {

  try {

    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = req.user.id;
    const orders = await Order.findAll({
      where: { customer_id: userId },
      include: [{ model: OrderItem, as: 'items' }],
      order: [['created_at', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

module.exports = router;

