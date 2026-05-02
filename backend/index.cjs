const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const multer = require('multer');
const { Pool } = require('pg');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const { compressImage } = require('./src/utils/imageProcessor');

// Initialize Pool for non-sequelize routes
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});


// 1. IMPORT CENTRAL DATABASE
const sequelize = require('./src/config/database');

// 2. IMPORT ALL MODELS (Crucial: Models must be loaded before sync!)
const Admin = require('./src/models/Admin');
const { Menu, SubMenu, HeaderConfig } = require('./src/models/Menu');
const Banner = require('./src/models/Banner');
const Benefit = require('./src/models/Benefit');
const Category = require('./src/models/Category');
const Faq = require('./src/models/Faq');
const SectionSetting = require('./src/models/SectionSetting');
const Subscriber = require('./src/models/Subscriber');
const Permission = require('./src/models/Permission');
const seedPermissions = require('./seedPermissions');
const AtelierHour = require('./src/models/AtelierHour');
const FooterLink = require('./src/models/FooterLink');
const SocialLink = require('./src/models/SocialLink');
const Product = require('./src/models/Product');
const CustomerAddress = require('./src/models/CustomerAddress');

const ActivityLog = require('./src/models/ActivityLog');
const Setting = require('./src/models/Setting');
const FuneralContent = require('./src/models/FuneralContent');
const FuneralFacility = require('./src/models/FuneralFacility');
const HospitalContent = require('./src/models/HospitalContent');
const HospitalFacility = require('./src/models/HospitalFacility');
const DeliveryArea = require('./src/models/DeliveryArea');
const DeliveryAreaContent = require('./src/models/DeliveryAreaContent');
const DeliveryAreaPolicy = require('./src/models/DeliveryAreaPolicy');
const Customer = require('./src/models/Customer');
const Cart = require('./src/models/Cart');
const CartItem = require('./src/models/CartItem');
const Order = require('./src/models/Order');
const OrderItem = require('./src/models/OrderItem');
const Discount = require('./src/models/Discount');
const DiscountUsage = require('./src/models/DiscountUsage');

// Associations
Admin.hasMany(ActivityLog, { foreignKey: 'admin_id' });
ActivityLog.belongsTo(Admin, { foreignKey: 'admin_id' });

Customer.hasMany(Cart, { foreignKey: 'customer_id' });
Cart.belongsTo(Customer, { foreignKey: 'customer_id' });

Cart.hasMany(CartItem, { foreignKey: 'cart_id', as: 'items' });
CartItem.belongsTo(Cart, { foreignKey: 'cart_id' });
CartItem.belongsTo(Product, { foreignKey: 'product_id' });

Customer.hasMany(Order, { foreignKey: 'customer_id' });
Order.belongsTo(Customer, { foreignKey: 'customer_id' });

Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id' });

Customer.hasMany(CustomerAddress, { foreignKey: 'customer_id', as: 'addresses' });
CustomerAddress.belongsTo(Customer, { foreignKey: 'customer_id' });

Discount.hasMany(DiscountUsage, { foreignKey: 'discount_id', as: 'usages' });
DiscountUsage.belongsTo(Discount, { foreignKey: 'discount_id' });
DiscountUsage.belongsTo(Order, { foreignKey: 'order_id' });
Order.hasOne(DiscountUsage, { foreignKey: 'order_id' });


const app = express();


app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', '*');
  }
}));

// Global Error Handlers to prevent server crashes
process.on('uncaughtException', (err) => {
  console.error('[CRITICAL] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

// Global Request Logger for Debugging
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: false, // For local image serving
}));
app.use(cookieParser());

// const allowedOrigins = [
//   'http://localhost:5173',
//   'http://127.0.0.1:5173',
//   process.env.FRONTEND_URL,
//   process.env.APP_DOMAIN,
//   'https://flowershop.mbwhost.in',
//   'http://flowershop.mbwhost.in',
//   'https://www.flowershop.mbwhost.in',
//   'http://www.flowershop.mbwhost.in'
// ].filter(Boolean);

app.use(cors({
  origin: true,
  credentials: true,
}));

// Rate limiting for API routes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: 'Too many requests',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const auditLogger = require('./src/middleware/audit');
app.use(auditLogger);

//app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

// Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Upload Endpoint with Compression
app.post('/api/upload', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    console.log('[UPLOAD] Starting compression for:', req.file.path);
    const compressed = await compressImage(req.file.path, UPLOAD_DIR, 300);
    console.log('[UPLOAD] Compression successful:', compressed.filename);

    // Remove the original uncompressed file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
      console.log('[UPLOAD] Original file removed');
    }

    const imageUrl = `${process.env.APP_DOMAIN}/uploads/${compressed.filename}`;
    res.json({ imageUrl });
  } catch (err) {
    console.error('[UPLOAD] Image compression failed:', err);
    // Fallback to original if compression fails
    const imageUrl = `${process.env.APP_DOMAIN}/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  }
});

// 3. DATABASE SYNCHRONIZATION & SERVER STARTUP
sequelize
  .authenticate()
  .then(() => {
    console.log('Central Database handshaking successful...');
  })
  .catch((err) => {
    console.log('CRITICAL: Database Handshake Error: ' + err);
  });

// Fail-safe direct bulk route
app.post('/api/products/bulk-upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file provided' });

    const text = fs.readFileSync(req.file.path, 'utf8');
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);

    if (lines.length < 2) {
      return res.status(400).json({ message: 'CSV file is empty or missing data lines.' });
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const Product = require('./src/models/Product');

    // Find max ID for manual increment
    const maxProduct = await Product.findOne({ order: [['id', 'DESC']] });
    let nextId = (maxProduct ? maxProduct.id : 1000) + 1;

    const products = lines.slice(1).map((line, idx) => {
      const values = line.split(',').map(v => v.trim());
      const obj = { id: nextId + idx };

      headers.forEach((h, i) => {
        let val = values[i] || "";
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);

        // Map fields carefully
        if (h === 'name') obj.name = val;
        else if (h === 'price') obj.price = val;
        else if (h === 'category') obj.category = val;
        else if (h === 'stock') obj.stock = parseInt(val) || 0;
        else if (h === 'image') obj.image = val;
        else if (h === 'description') obj.description = val;
        else if (h === 'sub_category') obj.sub_category = val;
        else if (h === 'badge') obj.badge = val;
      });
      return obj;
    }).filter(p => p.name);

    if (products.length === 0) {
      return res.status(400).json({ message: 'No valid products found in CSV.' });
    }

    await Product.bulkCreate(products);
    fs.unlinkSync(req.file.path); // Clean up temp file

    console.log(`Bulk uploaded ${products.length} products successfully.`);
    res.status(201).json({ message: `Successfully imported ${products.length} products.` });
  } catch (err) {
    console.error('Bulk upload failed:', err);
    res.status(500).json({ message: 'Error processing bulk upload', error: err.message });
  }
});

app.post('/api/products/bulk', async (req, res) => {
  try {
    console.log('Direct JSON Bulk Route Triggered. Payload size:', req.body.length);
    const Product = require('./src/models/Product');
    const products = await Product.bulkCreate(req.body);
    res.status(201).json({ message: 'Direct Bulk Import Successful', count: products.length });
  } catch (err) {
    console.error('Error in Direct Bulk Import:', err);
    res.status(500).json({ message: 'Direct Bulk Import Failed', error: err.message });
  }
});

const authRoutes = require('./src/routes/auth');
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

// Dynamic Service Routes
const funeralRoutes = require('./src/routes/funeral');
const hospitalRoutes = require('./src/routes/hospital');
const deliveryAreaRoutes = require('./src/routes/deliveryAreas');

app.use('/api/funeral', funeralRoutes);
app.use('/funeral', funeralRoutes);

app.use('/api/hospital', hospitalRoutes);
app.use('/hospital', hospitalRoutes);

app.use('/api/delivery-areas', deliveryAreaRoutes);
app.use('/delivery-areas', deliveryAreaRoutes);

const bannerRoutes = require('./src/routes/banners');
app.use('/api/banners', bannerRoutes);
app.use('/banners', bannerRoutes);

const benefitRoutes = require('./src/routes/benefits');
app.use('/api/benefits', benefitRoutes);
app.use('/benefits', benefitRoutes);

const categoryRoutes = require('./src/routes/categories');
app.use('/api/categories', categoryRoutes);
app.use('/categories', categoryRoutes);

const faqRoutes = require('./src/routes/faqs');
app.use('/api/faqs', faqRoutes);
app.use('/faqs', faqRoutes);

const testimonialRoutes = require('./src/routes/testimonials');
app.use('/api/testimonials', testimonialRoutes);
app.use('/testimonials', testimonialRoutes);

const subscriberRoutes = require('./src/routes/subscribers');
app.use('/api/subscribers', subscriberRoutes);
app.use('/subscribers', subscriberRoutes);

const atelierRoutes = require('./src/routes/atelierHours');
app.use('/api/atelier-hours', atelierRoutes);
app.use('/atelier-hours', atelierRoutes);

const footerLinkRoutes = require('./src/routes/footerLinks');
app.use('/api/footer-links', footerLinkRoutes);
app.use('/footer-links', footerLinkRoutes);

const socialLinkRoutes = require('./src/routes/socialLinks');
app.use('/api/social-links', socialLinkRoutes);
app.use('/social-links', socialLinkRoutes);

const menuRoutes = require('./src/routes/menus');
app.use('/api/menus', menuRoutes);
app.use('/menus', menuRoutes);

const permissionsRouter = require('./src/routes/permissions');
app.use('/api/permissions', permissionsRouter);
app.use('/permissions', permissionsRouter);

const productRoutes = require('./src/routes/products');
app.use('/api/products', productRoutes);
app.use('/products', productRoutes);

const statsRoutes = require('./src/routes/stats');
app.use('/api/stats', statsRoutes);
app.use('/stats', statsRoutes);

const homeSectionRoutes = require('./src/routes/homeSections');
app.use('/api/home-sections', homeSectionRoutes);
app.use('/home-sections', homeSectionRoutes);

const cartRoutes = require('./src/routes/cart');
app.use('/api/cart', cartRoutes);
app.use('/cart', cartRoutes);

const orderRoutes = require('./src/routes/orders');
app.use('/api/orders', orderRoutes);
app.use('/orders', orderRoutes);

const sectionSettingsRoutes = require('./src/routes/sectionSettings');
app.use('/api/section-settings', sectionSettingsRoutes);
app.use('/section-settings', sectionSettingsRoutes);

const settingsRoutes = require('./src/routes/settings');
app.use('/api/settings', settingsRoutes);
app.use('/settings', settingsRoutes);

const customerRoutes = require('./src/routes/customers');
app.use('/api/customers', customerRoutes);
app.use('/customers', customerRoutes);

const addressRoutes = require('./src/routes/addresses');
app.use('/api/addresses', addressRoutes);

const discountRoutes = require('./src/routes/discounts');
app.use('/api/discounts', discountRoutes);
app.use('/discounts', discountRoutes);

// ---------------------------------------------------------

// ---------------------------------------------------------



// Collection Configuration Routes
app.get('/api/collections', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM collections ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching collections:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/collections/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const result = await pool.query('SELECT * FROM collections WHERE slug = $1', [slug]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Collection not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching collection:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/collections', async (req, res) => {
  const { id, slug, title, accent_title, description, bg_gradient, bg_class, title_class, filter_field, filter_value, is_active } = req.body;
  console.log('Incoming collection save request:', { id, slug, title });

  try {
    if (id) {
      // Direct update if ID exists
      const result = await pool.query(
        `UPDATE collections SET 
                slug = $1, title = $2, accent_title = $3, description = $4, bg_gradient = $5, 
                bg_class = $6, title_class = $7, filter_field = $8, filter_value = $9, is_active = $10 
                WHERE id = $11 RETURNING *`,
        [slug, title, accent_title, description, bg_gradient, bg_class, title_class, filter_field, filter_value, is_active ?? true, parseInt(id)]
      );
      return res.json(result.rows[0]);
    } else {
      // Insert for new records
      const result = await pool.query(
        `INSERT INTO collections 
              (slug, title, accent_title, description, bg_gradient, bg_class, title_class, filter_field, filter_value, is_active) 
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
              ON CONFLICT (slug) DO UPDATE SET 
              title = $2, accent_title = $3, description = $4, bg_gradient = $5, 
              bg_class = $6, title_class = $7, filter_field = $8, filter_value = $9,
              is_active = $10
              RETURNING *`,
        [slug, title, accent_title, description, bg_gradient, bg_class, title_class, filter_field, filter_value, is_active ?? true]
      );
      return res.status(201).json(result.rows[0]);
    }
  } catch (err) {
    console.error("Error saving collection:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.delete('/api/collections/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM collections WHERE id = $1', [id]);
    res.json({ message: 'Collection deleted' });
  } catch (err) {
    console.error("Error deleting collection:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Media Library Endpoints
app.get('/api/media', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM media ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching media:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/media', upload.array('files', 20), async (req, res) => {
  if (!req.files || req.files.length === 0) return res.status(400).json({ message: 'No files uploaded' });

  try {
    const lastResult = await pool.query('SELECT MAX(id) FROM media');
    let nextId = (parseInt(lastResult.rows[0].max) || 0) + 1;
    const inserted = [];

    for (const file of req.files) {
      try {
        const compressed = await compressImage(file.path, UPLOAD_DIR, 300);
        // Remove original
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

        const imageUrl = `${process.env.APP_DOMAIN}/uploads/${compressed.filename}`;
        const result = await pool.query(
          'INSERT INTO media (id, filename, url) VALUES ($1, $2, $3) RETURNING *',
          [nextId++, compressed.filename, imageUrl]
        );
        inserted.push(result.rows[0]);
      } catch (err) {
        console.error('Media compression failed for file:', file.filename, err);
        // Fallback
        const imageUrl = `${process.env.APP_DOMAIN}/uploads/${file.filename}`;
        const result = await pool.query(
          'INSERT INTO media (id, filename, url) VALUES ($1, $2, $3) RETURNING *',
          [nextId++, file.filename, imageUrl]
        );
        inserted.push(result.rows[0]);
      }
    }

    res.json({ message: `Successfully uploaded ${inserted.length} files`, assets: inserted });
  } catch (err) {
    console.error("Error saving media:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/media/:id', async (req, res) => {
  const { id } = req.params;
  const mediaId = parseInt(id);

  if (isNaN(mediaId)) {
    return res.status(400).json({ message: 'Invalid media ID' });
  }

  try {
    // Find file first to delete from disk
    const mediaResult = await pool.query('SELECT * FROM media WHERE id = $1', [mediaId]);

    if (mediaResult.rowCount > 0) {
      const filename = mediaResult.rows[0].filename;
      const filePath = path.join(UPLOAD_DIR, filename);

      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (fsError) {
        console.error("Warning: Could not delete physical file:", filePath, fsError.message);
        // We continue to delete from DB even if physical file is missing or locked
      }
    }

    await pool.query('DELETE FROM media WHERE id = $1', [mediaId]);
    res.json({ message: 'Media deleted successfully' });
  } catch (err) {
    console.error("Error deleting media:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});








// ---------------------------------------------------------
// FRONTEND SERVING (Safety Position)
// ---------------------------------------------------------
app.use(express.static(path.join(__dirname, '../dist')));

app.use((req, res) => {
  if (req.url.startsWith('/api')) {
    return res.status(404).json({ message: 'API Route Not Found' });
  }
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Final Boot sequence with comprehensive synchronization

const PORT = process.env.PORT || 3002;
sequelize.sync().then(async () => {
  console.log('Central Database Integrated & Synced (Atelier Studio Rules Active).');

  // Seeding required for active archival rules
  const seedSettings = require('./seedSettings');
  const { HeaderConfig } = require('./src/models/Menu');
  const AtelierHour = require('./src/models/AtelierHour');
  const FooterLink = require('./src/models/FooterLink');

  await seedSettings();
  await seedPermissions();

  // Ensure default seeds exist
  const hCount = await HeaderConfig.count();
  if (hCount === 0) await HeaderConfig.create({});

  // Hardened Boot sequence to prevent "automatic off" issues
  const server = app.listen(PORT, () => {
    console.log(`🚀 BOUTIQUE SERVER STABILIZED ON PORT ${PORT}`);
  });

  server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
      console.error(`[CRITICAL] Port ${PORT} is already in use. Please run 'pm2 delete all' or kill the existing process.`);
      process.exit(1);
    } else {
      console.error('[CRITICAL] Server Error:', e);
    }
  });

}).catch(err => {
  console.error('Handshake Failure during Database Integration:', err);
  const recoveryServer = app.listen(PORT, () => console.log(`🚀 BOUTIQUE SERVER RUNNING (RECOVERY MODE) ON PORT ${PORT}`));
  recoveryServer.on('error', (e) => console.error('[CRITICAL] Recovery Server Error:', e));
});

module.exports = app;
