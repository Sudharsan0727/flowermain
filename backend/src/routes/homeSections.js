const express = require('express');
const router = express.Router();
const HomeSection = require('../models/HomeSection');
const HomeSectionItem = require('../models/HomeSectionItem');

// Get all sections and their items
router.get('/', async (req, res) => {
    try {
        const sections = await HomeSection.findAll();
        const items = await HomeSectionItem.findAll({ order: [['position', 'ASC']] });
        res.json({ sections, items });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update section header/description
router.put('/section/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const { title, subtitle, description } = req.body;
        let section = await HomeSection.findOne({ where: { section_type: type } });
        if (section) {
            await section.update({ title, subtitle, description });
        } else {
            section = await HomeSection.create({ section_type: type, title, subtitle, description });
        }
        res.json(section);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// CRUD for items
router.get('/items/:type', async (req, res) => {
    try {
        const items = await HomeSectionItem.findAll({ 
            where: { section_type: req.params.type },
            order: [['position', 'ASC']]
        });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/items', async (req, res) => {
    try {
        const item = await HomeSectionItem.create(req.body);
        res.status(201).json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.put('/items/:id', async (req, res) => {
    try {
        const item = await HomeSectionItem.findByPk(req.params.id);
        if (item) {
            await item.update(req.body);
            res.json(item);
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/items/:id', async (req, res) => {
    try {
        const item = await HomeSectionItem.findByPk(req.params.id);
        if (item) {
            await item.destroy();
            res.json({ message: 'Item deleted' });
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Bulk reorder items
router.post('/reorder', async (req, res) => {
    try {
        const { orderedIds } = req.body;
        if (!Array.isArray(orderedIds)) return res.status(400).json({ message: 'Invalid payload' });

        await Promise.all(orderedIds.map((id, index) => 
            HomeSectionItem.update({ position: index }, { where: { id } })
        ));

        res.json({ message: 'Sequence synchronized' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
