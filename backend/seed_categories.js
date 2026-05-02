const Category = require('./src/models/Category');

async function seed() {
  try {
    const categories = [
      { name: "EASTER", image: "/src/assets/purple-bouquet.jpg", count: "09 Items", shape: "rounded-t-full", link: "/easter", position: 1 },
      { name: "ROSES", image: "/src/assets/fantastic-wedding-bouquet-consists-colorful-roses-bride.jpg", count: "10 Items", shape: "rounded-[3rem]", link: "/roses", position: 2 },
      { name: "BIRTHDAY", image: "/src/assets/colorful-bouquet-carnations-roses-windflowers-floss-flowers.jpg", count: "09 Items", shape: "rounded-t-full", link: "/birthday", position: 3 },
      { name: "SYMPATHY", image: "/src/assets/lush-purple-floral-bouquet-golden-vase-adorning-home-decor.jpg", count: "12 Items", shape: "rounded-[3rem]", link: "#", position: 4 },
      { name: "OCCASIONS", image: "/src/assets/bouquet-red-flowers-glass-vase-dark-background.jpg", count: "15 Items", shape: "rounded-t-full", link: "#", position: 5 },
      { name: "HOLIDAYS", image: "http://localhost:5000/uploads/1774960195704-indian-hindu-girl-traditional-violet-saree-sitting-cafe-table.jpg", count: "08 Items", shape: "rounded-[3rem]", link: "#", position: 6 },
    ];

    for (const c of categories) {
      await Category.findOrCreate({ where: { name: c.name }, defaults: c });
    }
    console.log("Categories seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
