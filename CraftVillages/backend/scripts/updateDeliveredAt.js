/**
 * Manually update deliveredAt for a specific order
 * Usage: node updateDeliveredAt.js <orderId> <daysAgo>
 * Example: node updateDeliveredAt.js 69109c73bf804f7245017730 8
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

        // Get command line arguments
        const orderId = process.argv[2];
        const daysAgo = parseInt(process.argv[3]);

        if (!orderId) {
            console.log('❌ Please provide order ID');
            console.log('Usage: node updateDeliveredAt.js <orderId> <daysAgo>');
            console.log('Example: node updateDeliveredAt.js 69109c73bf804f7245017730 8');
            return;
        }

        if (isNaN(daysAgo)) {
            console.log('❌ Please provide valid number of days');
            console.log('Usage: node updateDeliveredAt.js <orderId> <daysAgo>');
            console.log('Example: node updateDeliveredAt.js 69109c73bf804f7245017730 8');
            return;
        }

        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║   Update deliveredAt for Order                            ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        // Find order
        const order = await Order.findById(orderId);

        if (!order) {
            console.log(`❌ Order not found: ${orderId}`);
            return;
        }

        console.log(`📦 Found order: ${order._id}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Created: ${order.createdAt.toLocaleString('vi-VN')}`);
        console.log(`   Current deliveredAt: ${order.deliveredAt ? order.deliveredAt.toLocaleString('vi-VN') : 'null'}`);
        console.log(`   Seller Paid: ${order.sellerPayment?.isPaid ? 'YES' : 'NO'}\n`);

        // Calculate new deliveredAt
        const newDeliveredAt = new Date();
        newDeliveredAt.setDate(newDeliveredAt.getDate() - daysAgo);

        console.log(`🔄 Updating deliveredAt to: ${newDeliveredAt.toLocaleString('vi-VN')} (${daysAgo} days ago)\n`);

        // Update
        order.deliveredAt = newDeliveredAt;
        await order.save();

        console.log('✅ Updated successfully!\n');

        // Show updated info
        const updatedOrder = await Order.findById(orderId);
        console.log('📊 Updated Order Info:');
        console.log(`   Status: ${updatedOrder.status}`);
        console.log(`   Created: ${updatedOrder.createdAt.toLocaleString('vi-VN')}`);
        console.log(`   Delivered: ${updatedOrder.deliveredAt.toLocaleString('vi-VN')}`);
        console.log(`   Days since delivery: ${Math.floor((new Date() - updatedOrder.deliveredAt) / (1000 * 60 * 60 * 24))} days`);
        console.log(`   Seller Paid: ${updatedOrder.sellerPayment?.isPaid ? 'YES' : 'NO'}\n`);

        if (Math.floor((new Date() - updatedOrder.deliveredAt) / (1000 * 60 * 60 * 24)) >= 7) {
            console.log('💡 This order is now eligible for seller payment!');
            console.log('   Run: node backend/scripts/test7DayPayment.js --run\n');
        } else {
            const daysRemaining = 7 - Math.floor((new Date() - updatedOrder.deliveredAt) / (1000 * 60 * 60 * 24));
            console.log(`⏳ This order will be eligible for payment in ${daysRemaining} more day(s)\n`);
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

