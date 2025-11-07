/**
 * Seed Withdrawal Fee Configuration
 * Script để tạo cấu hình phí rút tiền mặc định
 * 
 * Usage:
 *   node scripts/seedWithdrawalFeeConfig.js
 */

const mongoose = require('mongoose');
const WithdrawalFeeConfig = require('../models/WithdrawalFeeConfig');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/craftvillages';

async function seedFeeConfig() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing configs (optional)
        const existingCount = await WithdrawalFeeConfig.countDocuments();
        console.log(`📊 Found ${existingCount} existing fee configs`);

        // Create default percentage-based config
        const percentageConfig = new WithdrawalFeeConfig({
            name: 'Default Percentage Fee',
            description: 'Phí rút tiền theo phần trăm với giới hạn min/max',
            type: 'PERCENTAGE',
            percentage: 1, // 1%
            minFee: 5000,  // Tối thiểu 5,000 VND
            maxFee: 50000, // Tối đa 50,000 VND
            vipExemption: true,
            isActive: true
        });

        await percentageConfig.save();
        console.log('✅ Created percentage-based fee config');

        // Create fixed fee config (inactive by default)
        const fixedConfig = new WithdrawalFeeConfig({
            name: 'Fixed Fee',
            description: 'Phí rút tiền cố định',
            type: 'FIXED',
            fixedAmount: 10000, // 10,000 VND
            vipExemption: true,
            isActive: false // Not active
        });

        await fixedConfig.save();
        console.log('✅ Created fixed fee config (inactive)');

        // Create tiered fee config (inactive by default)
        const tieredConfig = new WithdrawalFeeConfig({
            name: 'Tiered Fee',
            description: 'Phí rút tiền theo bậc',
            type: 'TIERED',
            tiers: [
                { minAmount: 0, maxAmount: 1000000, fee: 5000 },      // < 1M: 5k
                { minAmount: 1000001, maxAmount: 5000000, fee: 10000 }, // 1M-5M: 10k
                { minAmount: 5000001, maxAmount: 10000000, fee: 20000 }, // 5M-10M: 20k
                { minAmount: 10000001, maxAmount: 50000000, fee: 30000 } // > 10M: 30k
            ],
            minFee: 5000,
            vipExemption: true,
            isActive: false // Not active
        });

        await tieredConfig.save();
        console.log('✅ Created tiered fee config (inactive)');

        // Test fee calculation
        console.log('\n📊 Testing fee calculation:');
        
        const testAmounts = [100000, 500000, 1000000, 5000000, 10000000];
        
        for (const amount of testAmounts) {
            const fee = await WithdrawalFeeConfig.calculateFee(amount, 'NORMAL');
            console.log(`   Amount: ${amount.toLocaleString()} VND → Fee: ${fee.toLocaleString()} VND`);
        }

        // Test VIP exemption
        const vipFee = await WithdrawalFeeConfig.calculateFee(1000000, 'VIP');
        console.log(`   VIP user (1M VND) → Fee: ${vipFee.toLocaleString()} VND (should be 0)`);

        console.log('\n✅ Seed completed successfully!');
        
    } catch (error) {
        console.error('❌ Error seeding fee config:', error);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Disconnected from MongoDB');
    }
}

// Run seed
seedFeeConfig();

