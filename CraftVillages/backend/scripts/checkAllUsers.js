require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Role = require('../models/Role');

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/craftvillages');
        console.log('Connected to MongoDB\n');

        // Lấy tất cả roles
        const roles = await Role.find({});
        console.log('📋 All Roles:');
        roles.forEach(role => {
            console.log(`  - ${role.roleName} (ID: ${role._id})`);
        });

        // Lấy user có shipperCode
        console.log('\n📦 Users with shipperCode:');
        const usersWithShipperCode = await User.find({ shipperCode: { $exists: true, $ne: null } })
            .populate('roleId');
        
        usersWithShipperCode.forEach((user, index) => {
            console.log(`\n${index + 1}. ${user.fullName}`);
            console.log('   Email:', user.email);
            console.log('   Phone:', user.phoneNumber);
            console.log('   ID:', user._id);
            console.log('   Shipper Code:', user.shipperCode);
            console.log('   Role:', user.roleId?.roleName || 'N/A');
            console.log('   Has shipperInfo:', !!user.shipperInfo);
        });

        // Tìm user cụ thể theo ObjectId từ data bạn cung cấp
        console.log('\n🔍 Looking for specific user ID: 68fc3422796a593588dbddab');
        const specificUser = await User.findById('68fc3422796a593588dbddab').populate('roleId');
        if (specificUser) {
            console.log('✅ Found user:', specificUser.fullName);
            console.log('   Email:', specificUser.email);
            console.log('   Phone:', specificUser.phoneNumber);
            console.log('   Role:', specificUser.roleId?.roleName);
            console.log('   Shipper Code:', specificUser.shipperCode);
            console.log('   ShipperInfo:', JSON.stringify(specificUser.shipperInfo, null, 2));
        } else {
            console.log('❌ User not found');
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.connection.close();
    }
};

checkUsers();
