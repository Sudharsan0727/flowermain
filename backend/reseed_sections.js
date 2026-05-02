const sequelize = require('./src/config/database');
const HomeSection = require('./src/models/HomeSection');
const HomeSectionItem = require('./src/models/HomeSectionItem');

sequelize.authenticate()
  .then(async () => {
    // 1. Wipe and re-seed Home Sections for a clean state
    console.log('Cleaning existing sections...');
    await HomeSection.destroy({ where: {}, truncate: true, cascade: true }).catch(() => HomeSection.destroy({ where: {} }));
    await HomeSectionItem.destroy({ where: {}, truncate: true, cascade: true }).catch(() => HomeSectionItem.destroy({ where: {} }));

    console.log('Seeding fresh Home Sections...');
    await HomeSection.bulkCreate([
      { section_type: 'signature', title: 'Signature Arrangements', subtitle: 'Live Inventory', description: 'Our most sought-after botanical architectures.' },
      { section_type: 'discovery', title: 'Curated Discoveries', subtitle: 'Just Landed', description: 'Fresh arrivals from our private sustainable nurseries.' }
    ]);

    console.log('Seeding fresh Home Section Items...');
    await HomeSectionItem.bulkCreate([
      // Signature Section (All with product_id mapping if possible, but these are for showcase)
      { section_type: 'signature', title: 'Midnight Grace', price: '89.00', image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=800', badge: 'Best Seller', position: 1 },
      { section_type: 'signature', title: 'Azure Symphony', price: '120.00', image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?q=80&w=800', badge: 'Luxe', position: 2 },
      { section_type: 'signature', title: 'Crimson Velvet', price: '95.00', image: 'https://images.unsplash.com/photo-1550338861-b7cfeaf8ffd8?q=80&w=800', badge: 'New', position: 3 },
      { section_type: 'signature', title: 'Lunar Bloom', price: '110.00', image: 'https://images.unsplash.com/photo-1519340241574-29deeeeef2d4?q=80&w=800', badge: 'Trending', position: 4 },

      // Discovery Section
      { section_type: 'discovery', title: 'Amber Glow', price: '75.00', image: 'https://images.unsplash.com/photo-1591880911020-f3490a424e12?q=80&w=800', position: 1 },
      { section_type: 'discovery', title: 'Pearl Velvet', price: '95.00', image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=800', position: 2 },
      { section_type: 'discovery', title: 'Spring Whisper', price: '65.00', image: 'https://images.unsplash.com/photo-1533923485749-399fa388b1cc?q=80&w=800', position: 3 },
      { section_type: 'discovery', title: 'Golden Hour', price: '130.00', image: 'https://images.unsplash.com/photo-1533616688419-b7a585564566?q=80&w=800', position: 4 }
    ]);

    console.log('Seeding complete.');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
