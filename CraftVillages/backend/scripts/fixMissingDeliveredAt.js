/**
 * Fix missing deliveredAt for existing DELIVERED orders
 * For old orders, we'll use updatedAt as an approximation
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
        console.log('║   Fix Missing deliveredAt for DELIVERED Orders            ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        // Find all DELIVERED orders without deliveredAt
        const ordersToFix = await Order.find({
            status: 'DELIVERED',
            $or: [
                { deliveredAt: null },
                { deliveredAt: { $exists: false } }
            ]
        });

        if (ordersToFix.length === 0) {
            console.log('✅ No orders need fixing. All DELIVERED orders have deliveredAt!');
            return;
        }

        console.log(`📦 Found ${ordersToFix.length} DELIVERED orders without deliveredAt\n`);

        let fixedCount = 0;

        for (const order of ordersToFix) {
            // Use updatedAt as approximation for deliveredAt
            // This is the best we can do for historical data
            order.deliveredAt = order.updatedAt;
            await order.save();

            console.log(`✅ Fixed Order ${order._id}`);
            console.log(`   Set deliveredAt: ${order.deliveredAt.toLocaleString('vi-VN')}`);
            console.log(`   (Using updatedAt as approximation)\n`);

            fixedCount++;
        }

        console.log('='.repeat(80));
        console.log(`✅ Fixed ${fixedCount} orders successfully!\n`);

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

