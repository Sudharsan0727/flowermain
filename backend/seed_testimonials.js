require('dotenv').config();
const sequelize = require('./src/config/database');
const Testimonial = require('./src/models/Testimonial');

const testimonials = [
  {
    name: "Eleanor Vance",
    designation: "Verified Collector · London Studio",
    quote: "The Midnight Rose Symphony arrived in such a pristine state. It felt like a piece of art rather than just a bouquet. Simply breathtaking.",
    image: "https://images.unsplash.com/photo-1552825897-bb7e5e8c4e1b?w=400&h=500&fit=crop",
    status: "Active",
    position: 0
  },
  {
    name: "Julian Barnes",
    designation: "Floral Subscriber · Surrey Annex",
    quote: "I've been a subscriber for six months now. Every Friday feels like a celebration. The seasonal variety is absolutely unmatched.",
    image: "https://images.unsplash.com/photo-1490750967868-88df5691cc55?w=400&h=500&fit=crop",
    status: "Active",
    position: 1
  },
  {
    name: "Sophia Thorne",
    designation: "Bridal Client · Chelsea Boutique",
    quote: "Our wedding flowers were the talk of the evening. The team's attention to detail and color palette was beyond my expectations.",
    image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&h=500&fit=crop",
    status: "Active",
    position: 2
  }
];

async function seed() {
  await sequelize.authenticate();
  await Testimonial.sync();
  const existing = await Testimonial.count();
  if (existing > 0) {
    console.log('Testimonials already seeded, skipping.');
    process.exit(0);
  }
  await Testimonial.bulkCreate(testimonials);
  console.log('✅ Seeded 3 testimonials successfully!');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
