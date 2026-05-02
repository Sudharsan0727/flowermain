const sequelize = require('./src/config/database');
const Benefit = require('./src/models/Benefit');
const Banner = require('./src/models/Banner');
const FAQ = require('./src/models/FAQ');
const Testimonial = require('./src/models/Testimonial');
const Category = require('./src/models/Category');

async function seedEverything() {
    await sequelize.authenticate();
    console.log('Seeding defaults for all administrative panels...');

    const options = { truncate: true, cascade: true };

    // 1. Benefits (Why Choose Us)
    console.log('Cleaning/Seeding Benefits...');
    await Benefit.destroy({ where: {} }).catch(() => {});
    await Benefit.bulkCreate([
        { title: "Direct Sourcing", description: "Fresh from the farm to your doorstep with no middlemen.", status: 'Active', position: 1, icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
        { title: "Eco-Friendly", description: "Our stems are selected from sustainable gardens that minimize footprint.", status: 'Active', position: 2, icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
        { title: "Artisan Design", description: "Curated by master florists with over 20 years of botanical expertise.", status: 'Active', position: 3, icon: "M13 10V3L4 14h7v7l9-11h-7z" }
    ]);

    // 2. Banners
    console.log('Cleaning/Seeding Banners...');
    await Banner.destroy({ where: {} }).catch(() => {});
    await Banner.bulkCreate([
        { 
            title: "Where Flowers Become Art.", 
            subtitle: "Luxury bouquet ateliers crafted by master florists. Rare stems, avant-garde design, and same-day delivery across the city.", 
            type: "Hero Slider", 
            status: 'Active', 
            image: "HeroPrimary",
            imageSecondary: "HeroSecondary",
            imageTertiary: "HeroTertiary",
            topTagline: "Gallatin · Atelier MMXXV",
            btnOneText: "Shop The Edit", 
            btnOneLink: "/explore",
            statOneNum: "12K+", statOneLabel: "Bouquets Delivered",
            statTwoNum: "98%", statTwoLabel: "5-Star Reviews",
            statThreeNum: "2hr", statThreeLabel: "Express Delivery"
        }
    ]);

    // 3. FAQs
    console.log('Cleaning/Seeding FAQs...');
    await FAQ.destroy({ where: {} }).catch(() => {});
    await FAQ.bulkCreate([
        { question: "How long do the flowers stay fresh?", answer: "Our flowers typically last 7-10 days if cared for properly.", status: 'Active', position: 1 },
        { question: "Do you offer same-day delivery?", answer: "Yes, for orders placed before 1 PM in our studio coverage areas.", status: 'Active', position: 2 }
    ]);

    // 4. Testimonials
    console.log('Cleaning/Seeding Testimonials...');
    await Testimonial.destroy({ where: {} }).catch(() => {});
    await Testimonial.bulkCreate([
        { name: "Eleanor Vance", designation: "Creative Director", quote: "The quality of the Midnight Grace bouquet was stunning! It lasted far longer than expected.", image: "https://i.pravatar.cc/150?u=eleanor", status: 'Active', position: 1 },
        { name: "Julian Thorne", designation: "Art Collector", quote: "Truly avant-garde floral designs. Highly recommended for special occasions.", image: "https://i.pravatar.cc/150?u=julian", status: 'Active', position: 2 }
    ]);

    // 5. Categories
    console.log('Cleaning/Seeding Categories...');
    await Category.destroy({ where: {} }).catch(() => {});
    await Category.bulkCreate([
        { name: "Roses", status: 'Active', image: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?q=80&w=800", count: "12 Items", link: "/roses", position: 1 },
        { name: "Lilies", status: 'Active', image: "https://images.unsplash.com/photo-1502977249166-824b3a8a4d6d?q=80&w=800", count: "8 Items", link: "/lilies", position: 2 }
    ]);

    console.log('All seeding successfully complete.');
    process.exit(0);
}
seedEverything();
