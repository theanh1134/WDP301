/**
 * Migration script to import users data from JSON to MongoDB
 * Usage: node migrateUsers.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const usersData = require('../data/WDP.users.json'); // Path to your JSON file

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/craftvillages', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ MongoDB connected for migration');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        process.exit(1);
    }
};

const migrateUsers = async () => {
    try {
        console.log('🚀 Starting user migration...');
        
        // Map JSON data to User schema
        const mappedUsers = usersData.map(user => ({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            passwordHash: user.passwordHash,
            phoneNumber: user.phoneNumber,
            avatarUrl: user.avatarUrl,
            roleId: user.roleId,
            isActive: user.isActive,
            addresses: user.addresses || [],
            legalAgreements: user.legalAgreements || [],
            isEmailVerified: user.emailVerified || false,
            verifiedAt: user.verifiedAt || null,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }));

        // Delete existing users (optional - comment out if you want to keep existing data)
        // await User.deleteMany({});

        // Insert users
        const result = await User.insertMany(mappedUsers, { ordered: false });
        
        console.log(`✅ Successfully migrated ${result.length} users`);
        console.log(`📊 Sample migrated user:`, result[0]);
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        if (error.writeErrors) {
            console.error('Write errors:', error.writeErrors);
        }
    } finally {
        await mongoose.disconnect();
        console.log('🔌 MongoDB disconnected');
    }
};

// Run migration
connectDB().then(() => migrateUsers());
