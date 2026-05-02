const sequelize = require('./src/config/database');
const Admin = require('./src/models/Admin');

sequelize.authenticate()
  .then(async () => {
    console.log('Querying table describe...');
    const result = await sequelize.getQueryInterface().describeTable('Admins');
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
