const mongoose = require('mongoose');
const User = require('../models/User');
const Role = require('../models/Role');
const Shipper = require('../models/Shipper');
require('dotenv').config();

const checkShipperUsers = async () => {
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
            console.log('❌ SHIPPER role not found in database!');
            process.exit(1);
        }

        console.log(`✅ SHIPPER role found: ${shipperRole._id}\n`);

        // Find users with SHIPPER role
        const shipperUsers = await User.find({ roleId: shipperRole._id }).populate('roleId');
        
        console.log(`📋 Found ${shipperUsers.length} user(s) with SHIPPER role:\n`);

        if (shipperUsers.length === 0) {
            console.log('⚠️  No users found with SHIPPER role.');
            console.log('   You need to create a shipper user first.\n');
        } else {
            for (const user of shipperUsers) {
                console.log(`👤 User: ${user.fullName}`);
                console.log(`   Email: ${user.email}`);
                console.log(`   ID: ${user._id}`);
                console.log(`   Role: ${user.roleId.roleName}`);
                console.log(`   Active: ${user.isActive ? '✅' : '❌'}`);
                console.log(`   Verified: ${user.isEmailVerified ? '✅' : '❌'}`);

                // Check if shipper profile exists
                const shipperProfile = await Shipper.findOne({ userId: user._id });
                
                if (shipperProfile) {
                    console.log(`   Shipper Profile: ✅ EXISTS`);
                    console.log(`      - License: ${shipperProfile.licenseNumber}`);
                    console.log(`      - Vehicle: ${shipperProfile.vehicleType} (${shipperProfile.vehicleNumber})`);
                    console.log(`      - Status: ${shipperProfile.status}`);
                    console.log(`      - Online: ${shipperProfile.isOnline ? '✅' : '❌'}`);
                } else {
                    console.log(`   Shipper Profile: ❌ NOT FOUND`);
                    console.log(`   ⚠️  This user needs a shipper profile created!`);
                }
                console.log('');
            }
        }

        // List all shipper profiles
        const allShipperProfiles = await Shipper.find().populate('userId');
        console.log(`\n📦 Total Shipper Profiles in database: ${allShipperProfiles.length}`);
        
        if (allShipperProfiles.length > 0) {
            console.log('\nShipper profiles:');
            for (const shipper of allShipperProfiles) {
                if (shipper.userId) {
                    console.log(`  - ${shipper.userId.fullName} (${shipper.userId.email})`);
                    console.log(`    License: ${shipper.licenseNumber}`);
                    console.log(`    Status: ${shipper.status}`);
                } else {
                    console.log(`  - Orphaned shipper profile (no user): ${shipper._id}`);
                }
            }
        }

        mongoose.connection.close();
        console.log('\n✅ Check completed');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

checkShipperUsers();
