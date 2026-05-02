const express = require('express');
const router = express.Router();
const SectionSetting = require('../models/SectionSetting');

// Get all settings for a section (e.g. GET /api/section-settings?section=whychooseus)
router.get('/', async (req, res) => {
  try {
    const { section } = req.query;
    const where = section ? { key: { [require('sequelize').Op.like]: `${section}_%` } } : {};
    const settings = await SectionSetting.findAll({ where });
    // Return as a key-value object for ease of use
    const result = {};
    settings.forEach(s => { result[s.key] = s.value; });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upsert (create or update) a batch of settings
// Body: { "whychooseus_tagline": "Our Commitment", "whychooseus_heading": "Why Choose ...", ... }
router.post('/upsert', async (req, res) => {
  try {
    const updates = req.body;
    const promises = Object.entries(updates).map(async ([key, value]) => {
      const existing = await SectionSetting.findOne({ where: { key } });
      if (existing) {
        return existing.update({ value });
      } else {
        return SectionSetting.create({ key, value });
      }
    });
    await Promise.all(promises);
    res.json({ message: 'Settings saved successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
