require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Shipper = require('../models/Shipper');

const testShipperAPI = async () => {
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

        console.log('✅ User found:');
        console.log('   Name:', user.fullName);
        console.log('   Email:', user.email);
        console.log('   User ID:', user._id.toString());
        console.log('   Shipper Code:', user.shipperCode);

        // Tìm shipper profile
        const shipper = await Shipper.findOne({ userId: user._id });
        
        if (shipper) {
            console.log('\n✅ Shipper Profile found:');
            console.log('   Shipper ID:', shipper._id.toString());
            console.log('   License Number:', shipper.licenseNumber);
            console.log('   Vehicle Type:', shipper.vehicleType);
            console.log('   Vehicle Number:', shipper.vehicleNumber);
            console.log('   Status:', shipper.status);
            console.log('   Is Online:', shipper.isOnline);
            console.log('   Rating:', shipper.rating.average);
            console.log('   Total Deliveries:', shipper.totalDeliveries);
            console.log('   Service Areas:', shipper.serviceAreas);
            console.log('   Working Hours:', shipper.workingHours);
            console.log('   Documents:', shipper.documents);
            
            console.log('\n📊 API Response Structure:');
            console.log(JSON.stringify({
                success: true,
                data: {
                    user: {
                        id: user._id,
                        fullName: user.fullName,
                        email: user.email,
                        phoneNumber: user.phoneNumber,
                        avatarUrl: user.avatarUrl
                    },
                    shipper: shipper
                }
            }, null, 2));
        } else {
            console.log('\n❌ Shipper Profile NOT found for userId:', user._id.toString());
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
    }
};

testShipperAPI();
