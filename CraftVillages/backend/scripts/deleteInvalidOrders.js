/**
 * Delete orders with invalid product/seller data
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Order = require('../models/Order');
const Product = require('../models/Product');

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
        console.log('║   Delete Invalid Orders                                   ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        const invalidOrderIds = [
            '69109997098bc52ff9e0703c',
            '691099b9b679bfea8144fdd4'
        ];

        console.log(`🗑️  Deleting ${invalidOrderIds.length} invalid orders...\n`);

        for (const orderId of invalidOrderIds) {
            const order = await Order.findById(orderId);
            if (order) {
                console.log(`📦 Order: ${orderId}`);
                console.log(`   Created: ${order.createdAt.toLocaleString('vi-VN')}`);
                console.log(`   Amount: ${order.finalAmount.toLocaleString()} VND`);
                
                await Order.findByIdAndDelete(orderId);
                console.log(`   ✅ Deleted\n`);
            } else {
                console.log(`📦 Order: ${orderId}`);
                console.log(`   ⚠️  Not found\n`);
            }
        }

        console.log('✅ Cleanup completed!\n');

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

