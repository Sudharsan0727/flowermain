const sequelize = require('./src/config/database');
const HospitalFacility = require('./src/models/HospitalFacility');

const hospitals = [
  {
    city: "New York, NY, USA",
    facilities: [
      { name: "NYU Langone Health", address: "550 1st Ave, New York, NY 10016, USA", phone: "(212) 263-5800" },
      { name: "Mount Sinai Hospital", address: "1468 Madison Ave, New York, NY 10029, USA", phone: "(212) 241-6500" },
      { name: "Lenox Hill Hospital", address: "100 E 77th St, New York, NY 10075, USA", phone: "(212) 434-2000" },
      { name: "Memorial Sloan Kettering", address: "1275 York Ave, New York, NY 10065, USA", phone: "(212) 639-2000" },
    ]
  },
  {
    city: "Los Angeles, CA, USA",
    facilities: [
      { name: "Cedars-Sinai Medical Center", address: "8700 Beverly Blvd, Los Angeles, CA 90048, USA", phone: "(310) 423-3277" },
      { name: "UCLA Health Medical Ctr", address: "757 Westwood Plaza, Los Angeles, CA 90095, USA", phone: "(310) 825-9111" },
      { name: "Keck Hospital of USC", address: "1500 San Pablo St, Los Angeles, CA 90033, USA", phone: "(323) 442-8500" },
    ]
  },
  {
    city: "Chicago, IL, USA",
    facilities: [
      { name: "Northwestern Memorial Hospital", address: "251 E Huron St, Chicago, IL 60611, USA", phone: "(312) 926-2000" },
      { name: "Rush University Medical Ctr", address: "1653 W Congress Pkwy, Chicago, IL 60612, USA", phone: "(312) 942-5000" },
      { name: "UChicago Medicine", address: "5841 S Maryland Ave, Chicago, IL 60637, USA", phone: "(773) 702-1000" },
    ]
  }
];

async function seed() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.');
        await sequelize.sync(); // Create tables if they don't exist
        console.log('Database synced.');

        for (const group of hospitals) {
            for (let i = 0; i < group.facilities.length; i++) {
                const fac = group.facilities[i];
                await HospitalFacility.create({
                    city: group.city,
                    name: fac.name,
                    address: fac.address,
                    phone: fac.phone,
                    status: 'Active',
                    position: i
                });
            }
        }
        console.log('Successfully seeded hospital facilities!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding data:', err);
        process.exit(1);
    }
}

seed();
