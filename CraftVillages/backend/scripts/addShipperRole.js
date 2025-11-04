const mongoose = require('mongoose');
const Role = require('../models/Role');
require('dotenv').config();

const addShipperRole = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/craftvillages', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('✅ Connected to MongoDB');

        // Check if SHIPPER role already exists
        const existingRole = await Role.findOne({ roleName: 'SHIPPER' });
        
        if (existingRole) {
            console.log('ℹ️  SHIPPER role already exists');
            console.log(existingRole);
        } else {
            // Create SHIPPER role
            const shipperRole = new Role({
                roleName: 'SHIPPER',
                description: 'Shipper role for delivery personnel'
            });

            await shipperRole.save();
            console.log('✅ SHIPPER role created successfully');
            console.log(shipperRole);
        }

        // List all roles
        console.log('\n📋 All roles in database:');
        const allRoles = await Role.find();
        allRoles.forEach(role => {
            console.log(`  - ${role.roleName}: ${role.description}`);
        });

        mongoose.connection.close();
        console.log('\n✅ Script completed');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

addShipperRole();
