const mongoose = require('mongoose');
const User = require('../models/User');
const Role = require('../models/Role');
const Shipper = require('../models/Shipper');
require('dotenv').config();

const createTestShipperUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/craftvillages', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('✅ Connected to MongoDB\n');

        // Find SHIPPER role
        const shipperRole = await Role.findOne({ roleName: 'SHIPPER' });
        if (!shipperRole) {
            console.log('❌ SHIPPER role not found. Please run initializeRoles.js first.');
            process.exit(1);
        }

        console.log(`✅ SHIPPER role found: ${shipperRole._id}\n`);

        // Check if test shipper user already exists
        const existingUser = await User.findOne({ email: 'shipper@test.com' });
        
        let shipperUser;
        
        if (existingUser) {
            console.log('📝 User shipper@test.com already exists, updating role...');
            existingUser.roleId = shipperRole._id;
            existingUser.isEmailVerified = true;
            existingUser.isActive = true;
            await existingUser.save();
            shipperUser = existingUser;
            console.log('✅ User updated to SHIPPER role');
        } else {
            console.log('📝 Creating new shipper user...');
            // Create test shipper user
            shipperUser = new User({
                fullName: 'Nguyen Van A',
                email: 'shipper@test.com',
                phoneNumber: '0123456789',
                passwordHash: 'password123', // Will be hashed by pre-save hook
                roleId: shipperRole._id,
                isEmailVerified: true,
                isActive: true,
                addresses: ['123 Test Street, Hanoi']
            });
            await shipperUser.save();
            console.log('✅ Created test shipper user');
        }

        console.log(`   Email: ${shipperUser.email}`);
        console.log(`   Password: password123`);
        console.log(`   User ID: ${shipperUser._id}\n`);

        // Check if shipper profile exists
        let shipperProfile = await Shipper.findOne({ userId: shipperUser._id });

        if (shipperProfile) {
            console.log('✅ Shipper profile already exists');
        } else {
            console.log('📝 Creating shipper profile...');
            // Create shipper profile
            shipperProfile = new Shipper({
                userId: shipperUser._id,
                licenseNumber: 'DL12345678',
                vehicleType: 'MOTORBIKE',
                vehicleNumber: '29A-12345',
                maxWeight: 50,
                maxVolume: 100,
                serviceAreas: ['Hanoi', 'Ha Dong', 'Long Bien'],
                workingHours: {
                    start: '08:00',
                    end: '20:00'
                },
                isOnline: false,
                status: 'APPROVED', // Approve immediately for testing
                bankInfo: {
                    accountName: 'Nguyen Van A',
                    accountNumber: '1234567890',
                    bankName: 'Vietcombank',
                    accountType: 'Savings'
                },
                documents: {
                    licenseImage: '/uploads/shipper/license_sample.jpg',
                    vehicleRegistration: '/uploads/shipper/vehicle_sample.jpg',
                    insuranceDocument: '/uploads/shipper/insurance_sample.jpg'
                }
            });
            await shipperProfile.save();
            console.log('✅ Created shipper profile');
        }

        console.log(`   License: ${shipperProfile.licenseNumber}`);
        console.log(`   Vehicle: ${shipperProfile.vehicleType} - ${shipperProfile.vehicleNumber}`);
        console.log(`   Status: ${shipperProfile.status}\n`);

        console.log('✅ Test shipper user created successfully!\n');
        console.log('🔐 Login credentials:');
        console.log('   Email: shipper@test.com');
        console.log('   Password: password123\n');

        mongoose.connection.close();
        console.log('✅ Script completed');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

createTestShipperUser();
