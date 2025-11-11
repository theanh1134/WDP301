/**
 * Make an existing order 10 days old for testing
 * Usage: node backend/scripts/makeOrderOld.js <orderId> <daysAgo>
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

        const orderId = process.argv[2];
        const daysAgo = parseInt(process.argv[3]) || 10;

        if (!orderId) {
            console.log('❌ Usage: node backend/scripts/makeOrderOld.js <orderId> <daysAgo>');
            return;
        }

        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║   Make Order Old for Testing                             ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        const order = await Order.findById(orderId);
        if (!order) {
            console.log('❌ Order not found');
            return;
        }

        const oldDate = new Date();
        oldDate.setDate(oldDate.getDate() - daysAgo);

        console.log(`📦 Order: ${order._id}`);
        console.log(`📅 Current createdAt: ${order.createdAt.toLocaleString('vi-VN')}`);
        console.log(`📅 New createdAt: ${oldDate.toLocaleString('vi-VN')} (${daysAgo} days ago)\n`);

        // Update createdAt directly
        await Order.updateOne(
            { _id: orderId },
            { $set: { createdAt: oldDate } }
        );

        console.log('✅ Order date updated successfully!\n');

        // Reload and display
        const updated = await Order.findById(orderId);
        const age = Math.floor((new Date() - updated.createdAt) / (1000 * 60 * 60 * 24));
        console.log(`📊 Order is now ${age} days old`);
        console.log(`📊 Status: ${updated.status}\n`);

        if (updated.status !== 'DELIVERED') {
            console.log('💡 Now you can change status to DELIVERED to test auto payment:');
            console.log(`   node backend/scripts/testOrderAutoPayment.js ${orderId}\n`);
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

