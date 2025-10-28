const mongoose = require('mongoose');
const User = require('../models/User');
const Role = require('../models/Role');
require('dotenv').config();

const checkUserRoles = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/craftvillages', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('✅ Connected to MongoDB');

        // Get all users with their roles
        const users = await User.find().populate('roleId').select('email fullName roleId isActive isEmailVerified');

        console.log(`\n📋 Found ${users.length} users:\n`);

        users.forEach((user, index) => {
            const roleName = user.roleId?.roleName || 'NO ROLE';
            const status = user.isActive ? '✅ Active' : '❌ Inactive';
            const verified = user.isEmailVerified ? '✅ Verified' : '⚠️  Not Verified';
            
            console.log(`${index + 1}. ${user.email}`);
            console.log(`   Name: ${user.fullName}`);
            console.log(`   Role: ${roleName}`);
            console.log(`   Status: ${status}`);
            console.log(`   Email: ${verified}`);
            console.log('');
        });

        // Show role distribution
        const roleStats = {};
        users.forEach(user => {
            const roleName = user.roleId?.roleName || 'NO_ROLE';
            roleStats[roleName] = (roleStats[roleName] || 0) + 1;
        });

        console.log('\n📊 Role Distribution:');
        Object.entries(roleStats).forEach(([role, count]) => {
            console.log(`  ${role}: ${count} user(s)`);
        });

        // List all available roles
        console.log('\n🎭 Available Roles:');
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

checkUserRoles();
