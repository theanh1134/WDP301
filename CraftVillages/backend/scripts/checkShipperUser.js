require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Role = require('../models/Role');

const checkShipperUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/craftvillages');
        console.log('Connected to MongoDB\n');

        // Tìm role shipper
        const shipperRole = await Role.findOne({ roleName: 'Shipper' });
        console.log('Shipper Role:', shipperRole);

        if (shipperRole) {
            // Tìm tất cả user có role shipper
            const shipperUsers = await User.find({ roleId: shipperRole._id });
            console.log('\n📦 Found', shipperUsers.length, 'shipper users:\n');
            
            shipperUsers.forEach((user, index) => {
                console.log(`${index + 1}. ${user.fullName}`);
                console.log('   Email:', user.email);
                console.log('   Phone:', user.phoneNumber);
                console.log('   ID:', user._id);
                console.log('   Shipper Code:', user.shipperCode);
                console.log('   Has shipperInfo:', !!user.shipperInfo);
                if (user.shipperInfo) {
                    console.log('   Vehicle:', user.shipperInfo.vehicleType, user.shipperInfo.vehicleNumber);
                }
                console.log('');
            });
        } else {
            console.log('❌ Shipper role not found!');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
};

checkShipperUser();
