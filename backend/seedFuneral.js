const sequelize = require('./src/config/database');
const FuneralFacility = require('./src/models/FuneralFacility');

const funeralHomes = [
  {
    city: "New York, NY, USA",
    facilities: [
      { name: "Frank E. Campbell - The Funeral Chapel", address: "1076 Madison Ave, New York, NY 10028, USA", phone: "(212) 288-3500" },
      { name: "Greenwich Village Funeral Home", address: "199 Bleecker St, New York, NY 10012, USA", phone: "(212) 674-8055" },
      { name: "Crestwood Funeral Home", address: "445 W 43rd St, New York, NY 10036, USA", phone: "(212) 245-7575" },
      { name: "Redden's Funeral Home", address: "325 W 14th St, New York, NY 10014, USA", phone: "(212) 242-1456" },
    ]
  },
  {
    city: "Los Angeles, CA, USA",
    facilities: [
      { name: "Forest Lawn Memorial Park", address: "1712 S Glendale Ave, Glendale, CA 91205, USA", phone: "(888) 204-3131" },
      { name: "Hollywood Forever Cemetery", address: "6000 Santa Monica Blvd, Los Angeles, CA 90038, USA", phone: "(323) 469-1181" },
      { name: "Angelus Funeral Home", address: "3875 Crenshaw Blvd, Los Angeles, CA 90008, USA", phone: "(323) 296-6666" },
    ]
  },
  {
    city: "Chicago, IL, USA",
    facilities: [
      { name: "Drake & Son Funeral Home", address: "5303 N Western Ave, Chicago, IL 60625, USA", phone: "(773) 561-6874" },
      { name: "Alvarez Funeral Directors", address: "2500 N Cicero Ave, Chicago, IL 60639, USA", phone: "(773) 278-8888" },
      { name: "Peterson-Bassi Comfort Chapels", address: "6938 W North Ave, Chicago, IL 60707, USA", phone: "(773) 637-4444" },
    ]
  }
];

async function seed() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.');

        for (const group of funeralHomes) {
            for (let i = 0; i < group.facilities.length; i++) {
                const fac = group.facilities[i];
                await FuneralFacility.create({
                    city: group.city,
                    name: fac.name,
                    address: fac.address,
                    phone: fac.phone,
                    status: 'Active',
                    position: i
                });
            }
        }
        console.log('Successfully seeded funeral facilities!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding data:', err);
        process.exit(1);
    }
}

seed();
