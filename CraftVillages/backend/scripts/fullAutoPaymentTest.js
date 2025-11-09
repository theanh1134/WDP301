/**
 * Complete test: Update order date and test auto payment
 * Usage: node backend/scripts/fullAutoPaymentTest.js <orderId>
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Order = require('../models/Order');
const User = require('../models/User');
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

        const orderId = process.argv[2] || '69109e0e9aaa74218f5e3418';

        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║   Full Auto Payment Test                                  ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        // Step 1: Update createdAt to 10 days ago
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

        console.log('📅 Step 1: Making order 10 days old...\n');
        
        await Order.updateOne(
            { _id: orderId },
            { 
                $set: { 
                    createdAt: tenDaysAgo,
                    status: 'SHIPPED' // Reset to SHIPPED
                } 
            }
        );

        // Step 2: Load order and check
        let order = await Order.findById(orderId).populate('items.productId');
        if (!order) {
            console.log('❌ Order not found');
            return;
        }

        const orderAge = Math.floor((new Date() - order.createdAt) / (1000 * 60 * 60 * 24));

        console.log(`📦 Order: ${order._id}`);
        console.log(`📅 Created: ${order.createdAt.toLocaleString('vi-VN')} (${orderAge} days ago)`);
        console.log(`📊 Status: ${order.status}`);
        console.log(`💰 Amount: ${order.finalAmount.toLocaleString()} VND\n`);

        // Get seller info
        const product = order.items[0].productId;
        if (!product) {
            console.log('❌ Product not found');
            return;
        }

        const seller = await User.findById(product.shopId);
        if (!seller) {
            console.log('❌ Seller not found');
            return;
        }

        const balanceBefore = seller.balance || 0;
        console.log(`👤 Seller: ${seller.fullName}`);
        console.log(`💰 Balance Before: ${balanceBefore.toLocaleString()} VND\n`);

        // Step 3: Change status to DELIVERED
        console.log('🔄 Step 2: Changing status to DELIVERED...\n');
        console.log('='.repeat(80));

        await order.updateStatus('DELIVERED');

        console.log('='.repeat(80));

        // Step 4: Check results
        const updatedOrder = await Order.findById(orderId);
        const sellerAfter = await User.findById(seller._id);
        const balanceAfter = sellerAfter.balance || 0;
        const difference = balanceAfter - balanceBefore;

        console.log(`\n💳 Seller Payment Status: ${updatedOrder.sellerPayment?.isPaid ? 'PAID ✅' : 'UNPAID ❌'}`);
        
        if (updatedOrder.sellerPayment?.isPaid) {
            console.log(`💰 Amount Paid: ${updatedOrder.sellerPayment.netAmount.toLocaleString()} VND`);
            console.log(`📝 Transaction: ${updatedOrder.sellerPayment.transactionId}`);
            console.log(`💰 Seller Balance: ${balanceBefore.toLocaleString()} → ${balanceAfter.toLocaleString()} VND`);
            console.log(`💰 Difference: +${difference.toLocaleString()} VND\n`);
            console.log('✅ SUCCESS: Auto payment worked!\n');
        } else {
            console.log(`💰 Seller Balance: ${balanceBefore.toLocaleString()} → ${balanceAfter.toLocaleString()} VND`);
            console.log(`💰 Difference: +${difference.toLocaleString()} VND\n`);
            console.log('❌ FAILED: Seller was not paid automatically\n');
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

