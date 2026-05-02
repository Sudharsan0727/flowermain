const sequelize = require('./src/config/database');
const { Op } = require('sequelize');

async function fixLinks() {
    try {
        console.log('--- Starting Image Link Fix ---');
        
        // 1. Fix Products
        const Product = require('./src/models/Product');
        const products = await Product.findAll();
        for (let p of products) {
            if (p.image && p.image.includes('http')) {
                const parts = p.image.split('/uploads/');
                if (parts.length > 1) {
                    p.image = '/uploads/' + parts[1];
                    await p.save();
                }
            }
        }
        console.log('✅ Fixed Product images');

        // 2. Fix Banners
        const Banner = require('./src/models/Banner');
        const banners = await Banner.findAll();
        for (let b of banners) {
            if (b.imageUrl && b.imageUrl.includes('http')) {
                const parts = b.imageUrl.split('/uploads/');
                if (parts.length > 1) {
                    b.imageUrl = '/uploads/' + parts[1];
                    await b.save();
                }
            }
        }
        console.log('✅ Fixed Banner images');

        // 3. Fix Categories
        const Category = require('./src/models/Category');
        const categories = await Category.findAll();
        for (let c of categories) {
            if (c.image && c.image.includes('http')) {
                const parts = c.image.split('/uploads/');
                if (parts.length > 1) {
                    c.image = '/uploads/' + parts[1];
                    await c.save();
                }
            }
        }
        console.log('✅ Fixed Category images');

        console.log('--- ALL LINKS FIXED! ---');
        process.exit(0);
    } catch (err) {
        console.error('Error fixing links:', err);
        process.exit(1);
    }
}

fixLinks();
