/**
 * Test auto payment with existing order
 * Usage: node backend/scripts/testOrderAutoPayment.js <orderId>
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

        const orderId = process.argv[2] || '69109997098bc52ff9e0703c';

        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║   Test Auto Payment on Status Change                     ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        const order = await Order.findById(orderId);
        if (!order) {
            console.log('❌ Order not found');
            return;
        }

        const orderAge = Math.floor((new Date() - order.createdAt) / (1000 * 60 * 60 * 24));

        console.log(`📦 Order: ${order._id}`);
        console.log(`📅 Created: ${order.createdAt.toLocaleString('vi-VN')} (${orderAge} days ago)`);
        console.log(`📊 Current Status: ${order.status}`);
        console.log(`💰 Amount: ${order.finalAmount.toLocaleString()} VND`);
        console.log(`💳 Seller Payment Status: ${order.sellerPayment?.isPaid ? 'PAID' : 'UNPAID'}\n`);

        if (order.status === 'DELIVERED') {
            console.log('⚠️  Order is already DELIVERED');
            console.log('   Changing to SHIPPED first...\n');
            // Update directly without reloading
            await Order.updateOne({ _id: orderId }, { $set: { status: 'SHIPPED' } });
            // Reload to get fresh data
            const freshOrder = await Order.findById(orderId);
            console.log(`✅ Status changed to: ${freshOrder.status}\n`);

            // Now test with the fresh order
            console.log('🔄 Changing status to DELIVERED...\n');
            console.log('='.repeat(80));
            await freshOrder.updateStatus('DELIVERED');
            console.log('='.repeat(80));
        } else {
            console.log('🔄 Changing status to DELIVERED...\n');
            console.log('='.repeat(80));
            await order.updateStatus('DELIVERED');
            console.log('='.repeat(80));
        }

        // Reload order to check payment status
        const updatedOrder = await Order.findById(orderId);
        console.log(`\n💳 Seller Payment Status: ${updatedOrder.sellerPayment?.isPaid ? 'PAID ✅' : 'UNPAID ❌'}`);
        
        if (updatedOrder.sellerPayment?.isPaid) {
            console.log(`💰 Amount Paid: ${updatedOrder.sellerPayment.netAmount.toLocaleString()} VND`);
            console.log(`📝 Transaction: ${updatedOrder.sellerPayment.transactionId}`);
            console.log(`📅 Paid At: ${updatedOrder.sellerPayment.paidAt.toLocaleString('vi-VN')}\n`);
            console.log('✅ SUCCESS: Auto payment worked!\n');
        } else {
            console.log('\n❌ FAILED: Seller was not paid automatically\n');
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

