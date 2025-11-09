/**
 * Initialize Default Platform Fee Configuration
 * Run this script once to create the default platform fee configuration
 * 
 * Usage: node backend/scripts/initializePlatformFee.js
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const PlatformFeeConfig = require('../models/PlatformFeeConfig');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

const initializePlatformFee = async () => {
    try {
        console.log('\n🚀 Initializing Platform Fee Configuration...\n');

        // Check if default config already exists
        const existingDefault = await PlatformFeeConfig.findOne({ name: 'Default Platform Fee' });
        
        if (existingDefault) {
            console.log('⚠️  Default platform fee configuration already exists:');
            console.log(`   Name: ${existingDefault.name}`);
            console.log(`   Type: ${existingDefault.feeType}`);
            console.log(`   Rate: ${existingDefault.formattedRate}`);
            console.log(`   Active: ${existingDefault.isActive}`);
            console.log('\n✅ No action needed.');
            return;
        }

        // Create default configuration
        const defaultConfig = new PlatformFeeConfig({
            name: 'Default Platform Fee',
            description: 'Phí sàn mặc định cho tất cả giao dịch - 5% trên mỗi đơn hàng',
            feeType: 'PERCENTAGE',
            percentageRate: 5, // 5% default
            minimumFee: 1000, // Minimum 1,000 VND
            maximumFee: null, // No maximum
            isActive: true,
            priority: 0,
            effectiveFrom: new Date(),
            effectiveTo: null
        });

        await defaultConfig.save();

        console.log('✅ Default platform fee configuration created successfully!');
        console.log('\n📋 Configuration Details:');
        console.log(`   ID: ${defaultConfig._id}`);
        console.log(`   Name: ${defaultConfig.name}`);
        console.log(`   Type: ${defaultConfig.feeType}`);
        console.log(`   Rate: ${defaultConfig.formattedRate}`);
        console.log(`   Minimum Fee: ${defaultConfig.minimumFee.toLocaleString()} VND`);
        console.log(`   Active: ${defaultConfig.isActive}`);
        console.log(`   Priority: ${defaultConfig.priority}`);
        console.log(`   Effective From: ${defaultConfig.effectiveFrom.toISOString()}`);

        console.log('\n💡 Example Calculations:');
        const testAmounts = [50000, 100000, 500000, 1000000, 5000000];
        
        for (const amount of testAmounts) {
            const calculation = defaultConfig.calculateFee(amount);
            console.log(`   Order: ${amount.toLocaleString()} VND → Fee: ${calculation.feeAmount.toLocaleString()} VND (${calculation.feeRate}%) → Seller gets: ${calculation.netAmount.toLocaleString()} VND`);
        }

        console.log('\n🎯 Next Steps:');
        console.log('   1. You can create additional fee configurations via API');
        console.log('   2. Configure category-specific or shop-specific fees');
        console.log('   3. Set up tiered fee structures for different order amounts');
        console.log('\n✨ Platform fee system is ready to use!');

    } catch (error) {
        console.error('\n❌ Error initializing platform fee:', error);
        throw error;
    }
};

const main = async () => {
    try {
        await connectDB();
        await initializePlatformFee();
        
        console.log('\n✅ Script completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Script failed:', error);
        process.exit(1);
    }
};

main();

