const sequelize = require('./src/config/database');
const Admin = require('./src/models/Admin');
const HomeSection = require('./src/models/HomeSection');
const HomeSectionItem = require('./src/models/HomeSectionItem');
const bcrypt = require('bcryptjs');

sequelize.authenticate()
  .then(async () => {
    // 1. Reset Admin Password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await Admin.update({ password: hashedPassword }, { where: { username: 'admin' } });
    console.log('Admin password reset to admin123');

    // 2. Check Home Sections
    const sections = await HomeSection.findAll();
    console.log('Home Sections Count:', sections.length);
    if (sections.length === 0) {
        console.log('Home sections missing, seeding...');
        await HomeSection.bulkCreate([
          { section_type: 'signature', title: 'Signature Arrangements', subtitle: 'Live Inventory', description: 'Our most sought-after botanical architectures.' },
          { section_type: 'discovery', title: 'Curated Discoveries', subtitle: 'Just Landed', description: 'Fresh arrivals from our private sustainable nurseries.' }
        ]);
    }

    const items = await HomeSectionItem.findAll();
    console.log('Home Section Items Count:', items.length);
    if (items.length === 0) {
        console.log('Home items missing, seeding...');
        await HomeSectionItem.bulkCreate([
          { section_type: 'signature', title: 'Midnight Grace', price: '$89.00', image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=800', badge: 'Best Seller', position: 1, product_id: 22 },
          { section_type: 'signature', title: 'Azure Symphony', price: '$120.00', image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?q=80&w=800', badge: 'Luxe', position: 2, product_id: 23 },
          { section_type: 'discovery', title: 'Amber Glow', price: '$75.00', image: 'https://images.unsplash.com/photo-1591880911020-f3490a424e12?q=80&w=800', position: 1, product_id: 24 },
          { section_type: 'discovery', title: 'Pearl Velvet', price: '$95.00', image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=800', position: 2, product_id: 31 }
        ]);
    }

    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
