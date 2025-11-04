require('dotenv').config();
const mongoose = require('mongoose');
const Shipper = require('../models/Shipper');
const User = require('../models/User');

const updateShipperStatus = async () => {
    try {
        const dbUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/WDP';
        await mongoose.connect(dbUri);
        console.log('Connected to MongoDB\n');

        // Tìm user shipper
        const user = await User.findOne({ shipperCode: 'SHIP001' });
        if (!user) {
            console.log('❌ User not found');
            return;
        }

        console.log('Found user:', user.fullName, '(' + user.email + ')');

        // Cập nhật shipper
        const shipper = await Shipper.findOneAndUpdate(
            { userId: user._id },
            {
                status: 'APPROVED',
                isOnline: true,
                licenseNumber: 'DL' + Date.now().toString().slice(-6),
                'rating.average': 4.5,
                'rating.totalReviews': 50,
                totalDeliveries: 50,
                successfulDeliveries: 48
            },
            { new: true }
        );

        if (shipper) {
            console.log('\n✅ Updated Shipper:');
            console.log('   ID:', shipper._id);
            console.log('   Status:', shipper.status);
            console.log('   License:', shipper.licenseNumber);
            console.log('   Vehicle:', shipper.vehicleType, shipper.vehicleNumber);
            console.log('   Rating:', shipper.rating.average);
            console.log('   Total Deliveries:', shipper.totalDeliveries);
            console.log('   Is Online:', shipper.isOnline);
            console.log('   Service Areas:', shipper.serviceAreas);
        } else {
            console.log('❌ Shipper not found');
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
    }
};

updateShipperStatus();
