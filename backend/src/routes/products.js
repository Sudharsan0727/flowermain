const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll({
      order: [['id', 'DESC']],
    });
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create product
router.post('/', async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk create products
router.post('/bulk', async (req, res) => {
  try {
    console.log('Received bulk import request. Rows:', req.body.length);
    if (!req.body || !Array.isArray(req.body)) {
      return res.status(400).json({ message: 'Invalid data format. Expected an array of products.' });
    }
    const products = await Product.bulkCreate(req.body);
    console.log('Successfully imported', products.length, 'products.');
    res.status(201).json({ message: 'Bulk import successful', count: products.length });
  } catch (err) {
    console.error('Error bulk creating products:', err);
    res.status(500).json({ message: 'Bulk import failed', error: err.message });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    console.log(`Updating product ${req.params.id} with body:`, req.body);
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    await product.update(req.body);
    console.log('Update successful. New status:', product.status);
    res.json(product);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    await product.destroy();
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
