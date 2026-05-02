require('dotenv').config({ path: './.env' });
const { Menu, SubMenu } = require('./src/models/Menu');

const initialMenus = [
    { name: "Home", type: "Main Link", status: "Active", position: 1 },
    { name: "Easter", type: "Mega Menu", status: "Active", position: 2 },
    { name: "Roses", type: "Mega Menu", status: "Active", position: 3 },
    { name: "Birthday", type: "Dropdown", status: "Active", position: 4 },
    { name: "Sympathy", type: "Dropdown", status: "Active", position: 5 },
    { name: "Occasions", type: "Dropdown", status: "Active", position: 6 },
    { name: "Holidays", type: "Mega Menu", status: "Active", position: 7 },
];

const initialSympathyItems = [
    { name: "Funeral Flowers", position: 1 },
    { name: "Cremation and Memorial", position: 2 },
    { name: "Casket Flowers", position: 3 },
    { name: "Standing Sprays & Wreaths", position: 4 },
    { name: "Sympathy Arrangements", position: 5 },
    { name: "For the Home", position: 6 }
];

const initialOccasionsItems = [
    { name: "Patriotic Flowers", position: 1 },
    { name: "Wedding Flowers", position: 2 },
    { name: "Wedding Bouquets", position: 3 },
    { name: "Wedding Party Flowers", position: 4 },
    { name: "Ceremony Flowers", position: 5 },
    { name: "Reception Flowers", position: 6 },
    { name: "Just Because", position: 7 },
    { name: "Anniversary Flowers", position: 8 },
    { name: "Birthday Flowers", position: 9 },
    { name: "Get Well Flowers", position: 10 },
    { name: "Graduation Flowers", position: 11 },
    { name: "New Baby Flowers", position: 12 },
    { name: "Back to School Flowers", position: 13 },
    { name: "Corsages", position: 14 },
    { name: "Boutonnieres", position: 15 },
    { name: "Hairpieces & Handheld Bouquets", position: 16 }
];

const initialHolidaysItems = [
    { name: "Passover", position: 1 },
    { name: "Easter", position: 2 },
    { name: "Admin Professionals Day", position: 3 },
    { name: "Mother's Day", position: 4 },
    { name: "Father's Day", position: 5 },
    { name: "Rosh Hashanah", position: 6 },
    { name: "Grandparents Day", position: 7 },
    { name: "National Boss Day", position: 8 },
    { name: "Sweetest Day", position: 9 },
    { name: "Halloween", position: 10 },
    { name: "Thanksgiving (USA)", position: 11 },
    { name: "Hanukkah", position: 12 },
    { name: "Kwanzaa", position: 13 },
    { name: "Christmas", position: 14 },
    { name: "Valentine's Day", position: 15 }
];

async function seed() {
    try {
        await Menu.destroy({ where: {} });
        await SubMenu.destroy({ where: {} });

        for (const m of initialMenus) {
            const created = await Menu.create(m);
            if (m.name === 'Sympathy') {
                for (const sub of initialSympathyItems) {
                    await SubMenu.create({ ...sub, menuId: created.id });
                }
            } else if (m.name === 'Occasions') {
                for (const sub of initialOccasionsItems) {
                    await SubMenu.create({ ...sub, menuId: created.id });
                }
            } else if (m.name === 'Holidays') {
                for (const sub of initialHolidaysItems) {
                    await SubMenu.create({ ...sub, menuId: created.id });
                }
            }
        }
        console.log("Seeded successfully");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
seed();
