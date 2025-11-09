/**
 * Test automatic seller payment when order status changes to DELIVERED
 * - If order >= 7 days old: Pay immediately
 * - If order < 7 days old: Wait for cron job
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

        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║   Test Auto Payment on DELIVERED Status                  ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        // Test Case 1: Order >= 7 days old
        console.log('📦 TEST CASE 1: Order >= 7 days old (should pay immediately)\n');
        
        const oldOrders = await Order.find({
            status: { $ne: 'DELIVERED' },
            createdAt: { $lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }).limit(1);

        if (oldOrders.length > 0) {
            const order = oldOrders[0];
            const orderAge = Math.floor((new Date() - order.createdAt) / (1000 * 60 * 60 * 24));
            
            console.log(`Order ID: ${order._id}`);
            console.log(`Created: ${order.createdAt.toLocaleString('vi-VN')} (${orderAge} days ago)`);
            console.log(`Current Status: ${order.status}`);
            console.log(`Amount: ${order.finalAmount.toLocaleString()} VND\n`);

            // Get seller's balance before
            const product = await Product.findById(order.items[0].productId);
            if (product) {
                const seller = await User.findById(product.shopId);
                const balanceBefore = seller.balance || 0;
                console.log(`Seller Balance Before: ${balanceBefore.toLocaleString()} VND\n`);

                console.log('🔄 Changing status to DELIVERED...\n');
                await order.updateStatus('DELIVERED');

                // Check balance after
                await seller.reload();
                const balanceAfter = seller.balance || 0;
                console.log(`\nSeller Balance After: ${balanceAfter.toLocaleString()} VND`);
                console.log(`Difference: +${(balanceAfter - balanceBefore).toLocaleString()} VND\n`);

                if (balanceAfter > balanceBefore) {
                    console.log('✅ TEST PASSED: Seller was paid immediately!\n');
                } else {
                    console.log('❌ TEST FAILED: Seller was not paid!\n');
                }
            }
        } else {
            console.log('⚠️  No old orders found for testing\n');
        }

        console.log('='.repeat(80));

        // Test Case 2: Order < 7 days old
        console.log('\n📦 TEST CASE 2: Order < 7 days old (should wait)\n');
        
        const newOrders = await Order.find({
            status: { $ne: 'DELIVERED' },
            createdAt: { $gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }).limit(1);

        if (newOrders.length > 0) {
            const order = newOrders[0];
            const orderAge = Math.floor((new Date() - order.createdAt) / (1000 * 60 * 60 * 24));
            
            console.log(`Order ID: ${order._id}`);
            console.log(`Created: ${order.createdAt.toLocaleString('vi-VN')} (${orderAge} days ago)`);
            console.log(`Current Status: ${order.status}`);
            console.log(`Amount: ${order.finalAmount.toLocaleString()} VND\n`);

            // Get seller's balance before
            const product = await Product.findById(order.items[0].productId);
            if (product) {
                const seller = await User.findById(product.shopId);
                const balanceBefore = seller.balance || 0;
                console.log(`Seller Balance Before: ${balanceBefore.toLocaleString()} VND\n`);

                console.log('🔄 Changing status to DELIVERED...\n');
                await order.updateStatus('DELIVERED');

                // Check balance after
                await seller.reload();
                const balanceAfter = seller.balance || 0;
                console.log(`\nSeller Balance After: ${balanceAfter.toLocaleString()} VND`);
                console.log(`Difference: +${(balanceAfter - balanceBefore).toLocaleString()} VND\n`);

                if (balanceAfter === balanceBefore) {
                    console.log('✅ TEST PASSED: Seller was NOT paid (will wait for 7 days)!\n');
                } else {
                    console.log('❌ TEST FAILED: Seller was paid immediately (should wait)!\n');
                }
            }
        } else {
            console.log('⚠️  No new orders found for testing\n');
        }

        console.log('='.repeat(80));
        console.log('\n✅ All tests completed!\n');

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

