const sequelize = require('./src/config/database');
const Admin = require('./src/models/Admin');

sequelize.authenticate()
  .then(async () => {
    const list = await Admin.findAll({ attributes: ['id', 'username', 'email'] });
    console.log(JSON.stringify(list, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
