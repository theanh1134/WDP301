/**
 * Create Admin Business User
 * Email: theanhadmin@gmail.com
 * Password: 123456
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Role = require('../models/Role');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected\n');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

const createAdminUser = async () => {
    try {
        await connectDB();

        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║   Create Admin Business User                              ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        // Find ADMIN_BUSINESS role
        const adminRole = await Role.findOne({ roleName: 'ADMIN_BUSINESS' });
        
        if (!adminRole) {
            console.log('❌ ADMIN_BUSINESS role not found!');
            console.log('💡 Please run: node backend/scripts/initializeRoles.js first\n');
            return;
        }

        console.log(`✅ Found role: ${adminRole.roleName}\n`);

        // Check if admin user already exists
        const existingAdmin = await User.findOne({ email: 'theanhadmin@gmail.com' });

        if (existingAdmin) {
            console.log('📝 Admin user already exists!');
            console.log(`   Email: ${existingAdmin.email}`);
            console.log(`   Name: ${existingAdmin.fullName}`);
            console.log(`   Role: ${adminRole.roleName}`);
            console.log(`   Active: ${existingAdmin.isActive ? '✅' : '❌'}`);
            console.log(`   Verified: ${existingAdmin.isEmailVerified ? '✅' : '❌'}\n`);

            // Update role if needed
            if (existingAdmin.roleId.toString() !== adminRole._id.toString()) {
                console.log('🔄 Updating role to ADMIN_BUSINESS...');
                existingAdmin.roleId = adminRole._id;
                existingAdmin.isEmailVerified = true;
                existingAdmin.isActive = true;
                await existingAdmin.save();
                console.log('✅ Role updated!\n');
            }

            return;
        }

        // Create new admin user
        console.log('📝 Creating new admin user...\n');

        const adminUser = new User({
            fullName: 'Admin Business',
            email: 'theanhadmin@gmail.com',
            phoneNumber: '0123456789',
            passwordHash: '123456', // Will be hashed by pre-save hook
            roleId: adminRole._id,
            isEmailVerified: true,
            isActive: true,
            addresses: []
        });

        await adminUser.save();

        console.log('✅ Admin user created successfully!\n');
        console.log('📋 Admin Details:');
        console.log(`   Email: ${adminUser.email}`);
        console.log(`   Password: 123456`);
        console.log(`   Name: ${adminUser.fullName}`);
        console.log(`   Role: ${adminRole.roleName}`);
        console.log(`   Phone: ${adminUser.phoneNumber}`);
        console.log(`   Active: ✅`);
        console.log(`   Verified: ✅\n`);

        console.log('🎉 You can now login with:');
        console.log(`   Email: theanhadmin@gmail.com`);
        console.log(`   Password: 123456\n`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Database connection closed');
        process.exit(0);
    }
};

createAdminUser();

