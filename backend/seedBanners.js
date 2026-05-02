const { sequelize } = require('./src/models/Menu');
const Banner = require('./src/models/Banner');

const banners = [
  {
    title: "Where Flowers Become Art.",
    subtitle: "Luxury bouquet ateliers crafted by master florists. Rare stems, avant-garde design, and same-day delivery across the city.",
    image: "HeroPrimary",
    imageSecondary: "HeroSecondary",
    imageTertiary: "HeroTertiary",
    type: "Hero Slider",
    status: "Active",
    position: 1,
    btnOneText: "Shop The Edit",
    btnOneLink: "/roses",
    btnTwoText: "View Occasions",
    btnTwoLink: "/birthday",
    statOneNum: "12K+", statOneLabel: "Bouquets Delivered",
    statTwoNum: "98%", statTwoLabel: "5-Star Reviews",
    statThreeNum: "2hr", statThreeLabel: "Express Delivery",
  }
];

async function seedBanners() {
  try {
    // Removed sync({ alter: true }) for VPS safety
    // await sequelize.sync({ alter: true });
    console.log("Resetting banners...");

    await Banner.destroy({ truncate: true, restartIdentity: true }); // Delete all existing banners
    
    await Banner.bulkCreate(banners);
    console.log("Successfully seeded just the Main Banner!");
  } catch (error) {
    console.error("Failed to seed banners:", error);
  } finally {
    process.exit(0);
  }
}

seedBanners();
