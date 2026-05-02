require('dotenv').config({ path: './.env' });
const bcrypt = require('bcryptjs');
const Admin = require('./src/models/Admin');

const createAdmin = async () => {
    try {
        const username = 'admin';
        const password = 'password123';
        
        const existingAdmin = await Admin.findOne({ where: { username } });
        if (existingAdmin) {
            console.log('Admin already exists!');
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await Admin.create({
            username,
            password: hashedPassword,
            role: 'superadmin'
        });

        console.log('---------------------------------');
        console.log('Super Admin created successfully!');
        console.log(`Username: ${username}`);
        console.log(`Password: ${password}`);
        console.log('---------------------------------');
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
