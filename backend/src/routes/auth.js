const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const Admin = require('../models/Admin');
const crypto = require('crypto');
const { Op } = require('sequelize');
const Customer = require('../models/Customer');


// Middleware to verify session (using cookie)
const verifyToken = (req, res, next) => {
  const token = req.cookies.admin_token;
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
    req.admin = verified;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Admin Login
router.post('/login', [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;
  const Permission = require('../models/Permission');
  const { Op } = require('sequelize');
  console.log(`[AUTH] Login attempt for: ${username}`);

  try {
    const admin = await Admin.findOne({ where: { username } });
    if (!admin) {
      console.log(`[AUTH] User [${username}] not found in database.`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      console.log(`[AUTH] Password mismatch for [${username}].`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Determine target role format
    const rawRole = admin.role.toLowerCase();
    let displayRole = admin.role;
    if (rawRole === 'superadmin' || rawRole === 'admin') displayRole = 'Admin';
    if (rawRole === 'manager' || rawRole === 'editor') displayRole = 'Manager';
    if (rawRole === 'staff') displayRole = 'Staff';

    // Aggressive Permission Fetching (Search for both formats)
    const grantedPerms = await Permission.findAll({
      where: {
        role: { [Op.in]: [displayRole, rawRole, displayRole.toLowerCase()] },
        is_granted: true
      },
      attributes: ['permission_key']
    });

    const permissions = [...new Set(grantedPerms.map(p => p.permission_key))];

    console.log(`[AUTH] Login SUCCESS for [${username}] (${displayRole}). Perms: ${permissions.length}`);
    const token = jwt.sign(
      { id: admin.id, role: displayRole },
      process.env.JWT_SECRET || 'supersecretkey',
      { expiresIn: '1d' }
    );

    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({
      message: 'Logged in successfully',
      admin: {
        id: admin.id,
        username: admin.username,
        role: displayRole,
        permissions: permissions
      }
    });
  } catch (error) {
    console.error('Login authorization failed:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin Logout
router.post('/logout', (req, res) => {
  res.clearCookie('admin_token');
  res.json({ message: 'Logged out successfully' });
});

// Verify Session
router.get('/verify', verifyToken, async (req, res) => {
  const Permission = require('../models/Permission');
  const { Op } = require('sequelize');
  try {
    const admin = await Admin.findByPk(req.admin.id, {
      attributes: ['id', 'username', 'role']
    });
    if (!admin) return res.status(404).json({ message: 'User not found' });

    const rawRole = admin.role.toLowerCase();
    let displayRole = admin.role;
    if (rawRole === 'superadmin' || rawRole === 'admin') displayRole = 'Admin';
    if (rawRole === 'manager' || rawRole === 'editor') displayRole = 'Manager';
    if (rawRole === 'staff') displayRole = 'Staff';

    const grantedPerms = await Permission.findAll({
      where: {
        role: { [Op.in]: [displayRole, rawRole, displayRole.toLowerCase()] },
        is_granted: true
      },
      attributes: ['permission_key']
    });

    const permissions = [...new Set(grantedPerms.map(p => p.permission_key))];

    res.json({
      ...admin.toJSON(),
      role: displayRole,
      permissions: permissions
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

const nodemailer = require('nodemailer');

// Configure SMTP Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "taskenginembw@gmail.com",
    pass: "rgxi vkao aqli pafs",
  },
});

// Forgot Password Route
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Please provide a valid email'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;

  try {
    const admin = await Admin.findOne({ where: { email } });

    if (!admin) {
      return res.json({ message: 'If this email exists, a reset link will be sent.' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    const expires = Date.now() + 3600000; // 1 hour

    await admin.update({
      resetPasswordToken: token,
      resetPasswordExpires: expires
    });

    // Reset Link
    const resetUrl = `http://localhost:5173/admin/login?token=${token}`;

    // Send Email
    const mailOptions = {
      from: '"Atelier Security Gate" <taskenginembw@gmail.com>',
      to: email,
      subject: 'Administrator Password Reset Request',
      html: `
            <div style="font-family: serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 24px; background: #fafafa;">
                <h1 style="color: #4c1d95; text-align: center; margin-bottom: 24px;">Atelier Recovery Suite</h1>
                <p style="color: #475569; font-size: 16px; line-height: 1.6;">You are receiving this email because we received a request to reset the password for your administrator account.</p>
                <div style="text-align: center; margin: 40px 0;">
                    <a href="${resetUrl}" style="background-color: #7c3aed; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-family: sans-serif; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">Initialize Reset Protocol</a>
                </div>
                <p style="color: #64748b; font-size: 14px;">This initialization link will expire in 1 hour. If you did not request this, please ignore this email and your password will remain unchanged.</p>
                <div style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
                    <p style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em;">Secure Gateway Protocol v2.4</p>
                </div>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);

    res.json({ message: 'If this email exists, a reset link will be sent.' });
  } catch (error) {
    console.error('SMTP Error:', error);
    res.status(500).json({ message: 'Server error while sending recovery email' });
  }
});

// Reset Password Route
router.post('/reset-password', [
  body('token').notEmpty(),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { token, newPassword } = req.body;

  try {
    const admin = await Admin.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: Date.now() }
      }
    });

    if (!admin) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await admin.update({
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    });

    res.json({ message: 'Your password has been reset.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Utility Registration (Keeping it but adding validation)
router.post('/register', [
  body('username').trim().notEmpty().isLength({ min: 4 }),
  body('password').isLength({ min: 6 }),
], async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await Admin.create({
      username,
      password: hashedPassword,
      role: 'admin'
    });
    res.json({ message: 'Admin created', username: newAdmin.username });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating admin' });
  }
});



// --- Customer Auth ---
const verifyCustomerToken = (req, res, next) => {
  const token = req.cookies.customer_token;
  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
    req.user = verified;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Customer Register
router.post('/customer/register', async (req, res) => {
  const { email, password, first_name, last_name, phone } = req.body;
  try {
    const existing = await Customer.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const verification_token = crypto.randomBytes(32).toString('hex');
    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = await Customer.create({
      email,
      password: hashedPassword,
      first_name,
      last_name,
      phone,
      verification_token,
      is_verified: false
    });

    // Send Verification Email
    const verificationUrl = `${process.env.APP_DOMAIN}/api/auth/customer/verify/${verification_token}`;

    const mailOptions = {
      from: '"MBW Identity Gate" <taskenginembw@gmail.com>',
      to: email,
      subject: 'Verify Your Botanical Identity',
      html: `
        <div style="font-family: serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 24px; background: #fafafa;">
          <h1 style="color: #4c1d95; text-align: center; margin-bottom: 24px;">Atelier Identity Protocol</h1>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">Welcome to our circle. To access the private archive and finalize your registration, we must verify your identity.</p>
          <div style="margin: 24px 0; padding: 20px; background: #f1f5f9; border-radius: 16px; border: 1px solid #e2e8f0;">
            <p style="margin: 0; color: #64748b; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em;">Your Registered Email</p>
            <p style="margin: 8px 0 0 0; color: #1e293b; font-size: 14px;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 8px 0 0 0; color: #1e293b; font-size: 14px;"><strong>Password:</strong> ${password}</p>
          </div>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${verificationUrl}" style="background-color: #7c3aed; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-family: sans-serif; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">Yes, it me - Verify My Identity</a>
          </div>
          <p style="color: #64748b; font-size: 14px; text-align: center;">If you did not request this, please disregard this transmission.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      success: true,
      message: 'Verification email sent. Please check your inbox.',
      needsVerification: true
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error registering customer', error: error.message });
  }
});

// Customer Login
router.post('/customer/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const customer = await Customer.findOne({ where: { email } });
    if (!customer) return res.status(401).json({ message: 'Invalid credentials' });

    if (!customer.is_verified) {
      return res.status(401).json({
        message: 'Identity not verified. Please check your email.',
        unverified: true
      });
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

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

    res.json({ customer: { id: customer.id, email: customer.email, first_name: customer.first_name, last_name: customer.last_name } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Customer Logout
router.post('/customer/logout', (req, res) => {
  res.clearCookie('customer_token');
  res.json({ message: 'Logged out successfully' });
});

// Verify Customer Session
router.get('/customer/verify', verifyCustomerToken, async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.user.id, {
      attributes: ['id', 'email', 'first_name', 'last_name', 'phone']
    });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Customer Verify Email
router.get('/customer/verify/:token', async (req, res) => {
  const { token } = req.params;
  try {
    const customer = await Customer.findOne({ where: { verification_token: token } });
    if (!customer) {
      return res.send(`
        <div style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: #e11d48;">Verification Failed</h1>
          <p>Invalid or expired verification token.</p>
          <a href="${process.env.FRONTEND_URL}/account" style="color: #7c3aed;">Return to Site</a>
        </div>
      `);
    }

    await customer.update({
      is_verified: true,
      verification_token: null
    });

    // Redirect to frontend with success flag
    res.redirect(`${process.env.FRONTEND_URL}/account?verified=true`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

module.exports = router;
