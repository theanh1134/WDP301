require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Role = require('../models/Role');

const findAllUsers = async () => {
    try {
        const dbUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/WDP';
        await mongoose.connect(dbUri);
        console.log('Connected to MongoDB:', dbUri, '\n');

        // Lấy tất cả users
        const users = await User.find({}).populate('roleId').limit(20);
        console.log(`📦 Found ${users.length} users:\n`);
        
        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.fullName}`);
            console.log('   Email:', user.email);
            console.log('   Phone:', user.phoneNumber);
            console.log('   ID:', user._id.toString());
            console.log('   Role:', user.roleId?.roleName || 'N/A');
            console.log('   Shipper Code:', user.shipperCode || 'N/A');
            console.log('   Supported Zones:', user.supportedZones || []);
            console.log('');
        });

        // Tìm user shipper cụ thể
        const shipperUser = await User.findOne({ 
            $or: [
                { shipperCode: 'SHIP001' },
                { email: /phuc/i },
                { fullName: /Nguyen Van A/i }
            ]
        }).populate('roleId');

        if (shipperUser) {
            console.log('\n✅ Found Shipper User:');
            console.log('   Name:', shipperUser.fullName);
            console.log('   Email:', shipperUser.email);
            console.log('   ID:', shipperUser._id.toString());
            console.log('   Role:', shipperUser.roleId?.roleName);
            console.log('   Shipper Code:', shipperUser.shipperCode);
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.connection.close();
    }
};

findAllUsers();
