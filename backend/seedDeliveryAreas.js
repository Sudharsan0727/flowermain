const sequelize = require('./src/config/database');
const DeliveryArea = require('./src/models/DeliveryArea');
const DeliveryAreaContent = require('./src/models/DeliveryAreaContent');
const DeliveryAreaPolicy = require('./src/models/DeliveryAreaPolicy');

const deliveryCities = [
  { name: "Murfreesboro", zips: ["37127", "37128", "37129", "37130", "37132"] },
  { name: "Smyrna", zips: ["37167"] },
  { name: "La Vergne", zips: ["37086"] },
  { name: "Christiana", zips: ["37037"] },
  { name: "Rockvale", zips: ["37153"] },
  { name: "Lascassas", zips: ["37085"] },
  { name: "Eagleville", zips: ["37060"] },
  { name: "Milton", zips: ["37118"] },
  { name: "Readyville", zips: ["37149"] },
  { name: "Bradyville", zips: ["37026"] },
  { name: "Shelbyville", zips: ["37160"] }
];

const deliveryPolicies = [
    {
      title: "Same Day Delivery",
      description: "Order by 2:00 PM Mon-Fri, or 11:00 AM Sat for same-day arrival.",
      iconName: "clock"
    },
    {
      title: "Delivery Minimum",
      description: "A minimum order of $35.00 is required for all local deliveries.",
      iconName: "cart"
    },
    {
      title: "No Sunday Delivery",
      description: "We are closed on Sundays. Orders will be delivered on Monday.",
      iconName: "calendar"
    }
];

async function seed() {
  try {
    await sequelize.sync();
    
    // Clear existing
    await DeliveryArea.destroy({ where: {} });
    await DeliveryAreaContent.destroy({ where: {} });
    await DeliveryAreaPolicy.destroy({ where: {} });
    
    // Seed Areas
    for (let i = 0; i < deliveryCities.length; i++) {
      const city = deliveryCities[i];
      await DeliveryArea.create({
        city: city.name,
        zip_codes: city.zips.join(', '),
        position: i,
        status: 'Active'
      });
    }

    // Seed Content
    await DeliveryAreaContent.create({
        bannerTitle: 'Flower Delivery Area',
        bannerSubtitle: 'Delivery',
        bannerDescription: 'Find out if we deliver to your neighborhood. We serve Murfreesboro and surrounding areas with premium floral care.',
        specializedTitle: 'Specialized Care Locations',
        specializedDescription: 'We have established protocols for seamless delivery to sensitive locations like hospitals and funeral homes.',
        hospitalTitle: 'Hospitals',
        hospitalText: 'Same-day delivery available. Please provide the patient\'s full name and room number for prompt service.',
        funeralTitle: 'Funeral Homes',
        funeralText: 'We prioritize funeral services. Include service time and the name of the deceased in your order notes.'
    });

    // Seed Policies
    for (let i = 0; i < deliveryPolicies.length; i++) {
        await DeliveryAreaPolicy.create({
            ...deliveryPolicies[i],
            position: i
        });
    }
    
    console.log('Delivery Areas, Content and Policies seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
