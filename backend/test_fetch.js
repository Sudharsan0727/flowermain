const Product = require('./src/models/Product');
const sequelize = require('./src/config/database');

async function testFetch() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');
    const products = await Product.findAll();
    console.log(`Successfully fetched ${products.length} products.`);
    if (products.length > 0) {
      console.log('First product:', products[0].toJSON());
    }
  } catch (err) {
    console.error('FETCH ERROR:', err);
  } finally {
    await sequelize.close();
  }
}

testFetch();
