/**
 * Trigger payment for a specific order by changing status
 * This simulates the API call that would trigger the auto-payment logic
 * Usage: node backend/scripts/triggerPaymentForOrder.js <orderId>
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

        const orderId = process.argv[2];
        
        if (!orderId) {
            console.log('❌ Usage: node backend/scripts/triggerPaymentForOrder.js <orderId>');
            console.log('   Example: node backend/scripts/triggerPaymentForOrder.js 6910a4d68a8766d2c3b5c9ba\n');
            return;
        }

        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║   Trigger Auto Payment for Order                         ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        // Load order
        const order = await Order.findById(orderId).populate('items.productId');
        if (!order) {
            console.log('❌ Order not found');
            return;
        }

        const orderAge = Math.floor((new Date() - order.createdAt) / (1000 * 60 * 60 * 24));

        console.log(`📦 Order: ${order._id}`);
        console.log(`📅 Created: ${order.createdAt.toLocaleString('vi-VN')} (${orderAge} days ago)`);
        console.log(`📊 Current Status: ${order.status}`);
        console.log(`💰 Amount: ${order.finalAmount.toLocaleString()} VND`);
        console.log(`💳 Payment Status: ${order.sellerPayment?.isPaid ? 'PAID ✅' : 'UNPAID ❌'}\n`);

        if (order.sellerPayment?.isPaid) {
            console.log('⚠️  Order has already been paid!');
            console.log(`   Transaction: ${order.sellerPayment.transactionId}`);
            console.log(`   Amount: ${order.sellerPayment.netAmount.toLocaleString()} VND\n`);
            return;
        }

        // Get seller info
        let seller = null;
        if (order.items && order.items.length > 0) {
            const firstItem = order.items[0];
            if (firstItem.productId) {
                const product = await Product.findById(firstItem.productId);
                if (product && product.shopId) {
                    seller = await User.findById(product.shopId);
                }
            }
        }

        if (!seller) {
            console.log('❌ Cannot find seller for this order');
            console.log('   This order may have invalid product data\n');
            return;
        }

        const balanceBefore = seller.balance || 0;
        console.log(`👤 Seller: ${seller.fullName} (${seller.email})`);
        console.log(`💰 Balance Before: ${balanceBefore.toLocaleString()} VND\n`);

        // Check if order is old enough
        if (orderAge < 7) {
            console.log(`⚠️  Order is only ${orderAge} days old (need >= 7 days)`);
            console.log(`   Payment will be processed in ${7 - orderAge} more day(s)\n`);
            return;
        }

        // Trigger payment by changing status
        console.log('🔄 Triggering payment by updating status...\n');
        console.log('='.repeat(80));

        // If already DELIVERED, change to SHIPPED first
        if (order.status === 'DELIVERED') {
            console.log('⚠️  Order is already DELIVERED, changing to SHIPPED first...\n');
            order.status = 'SHIPPED';
            await order.save();
        }

        // Now change to DELIVERED (this will trigger auto-payment)
        await order.updateStatus('DELIVERED');

        console.log('='.repeat(80));

        // Check results
        const updatedOrder = await Order.findById(orderId);
        const sellerAfter = await User.findById(seller._id);
        const balanceAfter = sellerAfter.balance || 0;
        const difference = balanceAfter - balanceBefore;

        console.log(`\n💳 Payment Status: ${updatedOrder.sellerPayment?.isPaid ? 'PAID ✅' : 'UNPAID ❌'}`);
        
        if (updatedOrder.sellerPayment?.isPaid) {
            console.log(`💰 Amount Paid: ${updatedOrder.sellerPayment.netAmount.toLocaleString()} VND`);
            console.log(`📝 Transaction: ${updatedOrder.sellerPayment.transactionId}`);
            console.log(`💰 Platform Fee: ${updatedOrder.sellerPayment.platformFee.toLocaleString()} VND (${updatedOrder.sellerPayment.platformFeeRate}%)`);
            console.log(`\n💰 Seller Balance:`);
            console.log(`   Before: ${balanceBefore.toLocaleString()} VND`);
            console.log(`   After:  ${balanceAfter.toLocaleString()} VND`);
            console.log(`   Diff:   +${difference.toLocaleString()} VND\n`);
            console.log('✅ SUCCESS: Payment processed automatically!\n');
        } else {
            console.log(`\n💰 Seller Balance:`);
            console.log(`   Before: ${balanceBefore.toLocaleString()} VND`);
            console.log(`   After:  ${balanceAfter.toLocaleString()} VND`);
            console.log(`   Diff:   +${difference.toLocaleString()} VND\n`);
            console.log('❌ FAILED: Payment was not processed\n');
            console.log('💡 Possible reasons:');
            console.log('   - Order has refund request');
            console.log('   - Seller account issue');
            console.log('   - Product/Shop data missing\n');
        }

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error.stack);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Database connection closed');
        process.exit(0);
    }
};

main();

