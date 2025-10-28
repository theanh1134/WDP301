const mongoose = require('mongoose');
const User = require('../models/User');
const Role = require('../models/Role');
const Shipper = require('../models/Shipper');
require('dotenv').config();

const updateUserToShipper = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/WDP', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('✅ Connected to MongoDB\n');

        const userEmail = 'phucnthe170081@gmail.com';

        // Find the user
        const user = await User.findOne({ email: userEmail }).populate('roleId');
        if (!user) {
            console.log(`❌ User ${userEmail} not found!`);
            process.exit(1);
        }

        console.log('👤 Current User Info:');
        console.log(`   Name: ${user.fullName}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Current Role: ${user.roleId?.roleName || 'UNKNOWN'}`);
        console.log(`   User ID: ${user._id}\n`);

        // Find SHIPPER role
        const shipperRole = await Role.findOne({ roleName: 'SHIPPER' });
        if (!shipperRole) {
            console.log('❌ SHIPPER role not found!');
            process.exit(1);
        }

        console.log(`✅ SHIPPER role ID: ${shipperRole._id}\n`);

        // Update user role to SHIPPER
        console.log('📝 Updating user role to SHIPPER...');
        user.roleId = shipperRole._id;
        await user.save();
        console.log('✅ User role updated to SHIPPER\n');

        // Check if Shipper profile exists
        let shipperProfile = await Shipper.findOne({ userId: user._id });

        if (shipperProfile) {
            console.log('✅ Shipper profile already exists:');
            console.log(`   License: ${shipperProfile.licenseNumber}`);
            console.log(`   Vehicle: ${shipperProfile.vehicleType} - ${shipperProfile.vehicleNumber}`);
            console.log(`   Status: ${shipperProfile.status}`);
        } else {
            console.log('📝 Creating Shipper profile from user.shipperInfo...');
            
            // Create Shipper profile from user's shipperInfo
            const shipperInfo = user.shipperInfo || {};
            
            shipperProfile = new Shipper({
                userId: user._id,
                licenseNumber: user.shipperCode || 'SHIP001',
                vehicleType: shipperInfo.vehicleType === 'Xe máy' ? 'MOTORBIKE' : 'CAR',
                vehicleNumber: shipperInfo.vehicleNumber || '30A-12345',
                maxWeight: 50,
                maxVolume: 100,
                serviceAreas: user.supportedZones || ['Hà Nội'],
                workingHours: {
                    start: shipperInfo.workingHours?.start || '08:00',
                    end: shipperInfo.workingHours?.end || '22:00'
                },
                isOnline: shipperInfo.isAvailable || false,
                currentLocation: shipperInfo.currentLocation ? {
                    latitude: shipperInfo.currentLocation.latitude,
                    longitude: shipperInfo.currentLocation.longitude
                } : null,
                rating: {
                    average: shipperInfo.rating || 5,
                    totalReviews: 0
                },
                totalDeliveries: shipperInfo.totalDeliveries || 0,
                totalEarnings: 0,
                status: shipperInfo.status === 'active' ? 'APPROVED' : 'PENDING',
                bankInfo: {
                    accountName: user.fullName,
                    accountNumber: shipperInfo.bankAccountNumber || '',
                    bankName: shipperInfo.bankName || '',
                    accountType: 'Savings'
                },
                documents: {
                    licenseImage: shipperInfo.idCardFrontUrl || '',
                    vehicleRegistration: '',
                    insuranceDocument: shipperInfo.idCardBackUrl || ''
                }
            });

            await shipperProfile.save();
            console.log('✅ Shipper profile created:');
            console.log(`   License: ${shipperProfile.licenseNumber}`);
            console.log(`   Vehicle: ${shipperProfile.vehicleType} - ${shipperProfile.vehicleNumber}`);
            console.log(`   Status: ${shipperProfile.status}`);
        }

        console.log('\n✅ User successfully converted to SHIPPER!\n');
        console.log('🔐 Login with:');
        console.log(`   Email: ${user.email}`);
        console.log(`   Password: [your existing password]\n`);

        mongoose.connection.close();
        console.log('✅ Script completed');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

updateUserToShipper();
