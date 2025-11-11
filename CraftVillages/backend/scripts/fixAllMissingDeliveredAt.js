/**
 * Fix all DELIVERED orders that are missing deliveredAt
 * Set deliveredAt = updatedAt (as approximation)
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Order = require('../models/Order');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected\n');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

const main = async () => {
    try {
        await connectDB();

        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║   Fix All Missing deliveredAt for DELIVERED Orders       ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        // Find all DELIVERED orders without deliveredAt
        const ordersToFix = await Order.find({
            status: 'DELIVERED',
            $or: [
                { deliveredAt: null },
                { deliveredAt: { $exists: false } }
            ]
        }).sort({ updatedAt: -1 });

        if (ordersToFix.length === 0) {
            console.log('✅ All DELIVERED orders already have deliveredAt set!');
            console.log('   Nothing to fix.\n');
            return;
        }

        console.log(`📦 Found ${ordersToFix.length} DELIVERED orders without deliveredAt\n`);
        console.log('🔄 Fixing orders...\n');

        let fixed = 0;
        let failed = 0;

        for (const order of ordersToFix) {
            try {
                // Use updatedAt as approximation for deliveredAt
                order.deliveredAt = order.updatedAt;
                await order.save();

                console.log(`✅ [${fixed + 1}/${ordersToFix.length}] Fixed order: ${order._id}`);
                console.log(`   deliveredAt set to: ${order.deliveredAt.toLocaleString('vi-VN')}`);
                console.log(`   Days since delivery: ${Math.floor((new Date() - order.deliveredAt) / (1000 * 60 * 60 * 24))} days\n`);

                fixed++;
            } catch (error) {
                console.error(`❌ Failed to fix order ${order._id}:`, error.message);
                failed++;
            }
        }

        console.log('='.repeat(80));
        console.log('📊 SUMMARY');
        console.log('='.repeat(80));
        console.log(`Total orders: ${ordersToFix.length}`);
        console.log(`✅ Fixed: ${fixed}`);
        console.log(`❌ Failed: ${failed}\n`);

        if (fixed > 0) {
            console.log('💡 Next step: Run payment job to process eligible orders');
            console.log('   node backend/scripts/test7DayPayment.js --display\n');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Database connection closed');
        process.exit(0);
    }
};

main();

