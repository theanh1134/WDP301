const mongoose = require('mongoose');
const Role = require('../models/Role');
require('dotenv').config();

const initializeRoles = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/craftvillages', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('✅ Connected to MongoDB');

        const rolesToCreate = [
            {
                roleName: 'ADMIN_BUSINESS',
                description: 'Business administrator with full system access'
            },
            {
                roleName: 'SELLER_STAFF',
                description: 'Staff member managing seller operations'
            },
            {
                roleName: 'RETURN_STAFF',
                description: 'Staff member handling product returns and refunds'
            },
            {
                roleName: 'SELLER',
                description: 'Shop owner who can sell products'
            },
            {
                roleName: 'BUYER',
                description: 'Regular customer who can purchase products'
            },
            {
                roleName: 'SHIPPER',
                description: 'Delivery personnel for order shipments'
            }
        ];

        console.log('\n🔄 Creating/Updating roles...\n');

        for (const roleData of rolesToCreate) {
            const existingRole = await Role.findOne({ roleName: roleData.roleName });
            
            if (existingRole) {
                console.log(`✓ ${roleData.roleName} already exists`);
            } else {
                const newRole = new Role(roleData);
                await newRole.save();
                console.log(`✅ Created ${roleData.roleName}`);
            }
        }

        // List all roles
        console.log('\n📋 All roles in database:');
        const allRoles = await Role.find();
        allRoles.forEach(role => {
            console.log(`  ✓ ${role.roleName}: ${role.description}`);
        });

        mongoose.connection.close();
        console.log('\n✅ Script completed successfully');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

initializeRoles();
