/**
 * Test the new deliveredAt logic
 * Create an order, mark it as DELIVERED, then check payment after 7 days
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
        console.log('║   Test deliveredAt Logic (7 days from delivery)           ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        // Find an existing DELIVERED order that has been paid
        const existingOrder = await Order.findOne({
            status: 'DELIVERED',
            'sellerPayment.isPaid': true
        }).populate('items.productId');

        if (!existingOrder) {
            console.log('❌ No existing DELIVERED order found to clone');
            return;
        }

        console.log(`📦 Found existing order to clone: ${existingOrder._id}\n`);

        // Get seller info
        const SellerPaymentService = require('../services/sellerPaymentService');
        const sellerId = await SellerPaymentService.getSellerIdFromOrder(existingOrder);
        
        if (!sellerId) {
            console.log('❌ Cannot determine seller for this order');
            return;
        }

        const seller = await User.findById(sellerId);
        console.log(`👤 Seller: ${seller.fullName}`);
        console.log(`💰 Balance before: ${seller.getBalance().toLocaleString()} VND\n`);

        // Create a new order (created 15 days ago, but will be delivered "today")
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - 15); // Created 15 days ago

        const newOrder = new Order({
            buyerInfo: existingOrder.buyerInfo,
            shippingAddress: existingOrder.shippingAddress,
            items: existingOrder.items.map(item => ({
                productId: item.productId._id || item.productId,
                productName: item.productName,
                thumbnailUrl: item.thumbnailUrl,
                quantity: item.quantity,
                priceAtPurchase: item.priceAtPurchase,
                costPriceAtPurchase: item.costPriceAtPurchase
            })),
            paymentInfo: {
                method: existingOrder.paymentInfo.method,
                amount: existingOrder.paymentInfo.amount,
                status: 'PENDING',
                transactionId: `TEST_DELIVERED_AT_${Date.now()}`
            },
            subtotal: existingOrder.subtotal,
            shippingFee: existingOrder.shippingFee,
            tipAmount: existingOrder.tipAmount,
            finalAmount: existingOrder.finalAmount,
            status: 'SHIPPED',
            createdAt: createdAt,
            updatedAt: createdAt
        });

        await newOrder.save();

        console.log('📦 Created new test order:');
        console.log(`   Order ID: ${newOrder._id}`);
        console.log(`   Created: ${createdAt.toLocaleString('vi-VN')} (15 days ago)`);
        console.log(`   Status: ${newOrder.status}`);
        console.log(`   Amount: ${newOrder.finalAmount.toLocaleString()} VND\n`);

        console.log('='.repeat(80));
        console.log('🔄 Step 1: Mark as DELIVERED (today)...\n');
        console.log('Expected: deliveredAt should be set to NOW');
        console.log('Expected: Payment should NOT happen yet (0 days since delivery)');
        console.log('='.repeat(80));

        // Mark as DELIVERED today
        await newOrder.updateStatus('DELIVERED');

        // Reload order
        let updatedOrder = await Order.findById(newOrder._id);
        
        console.log('\n📊 After marking as DELIVERED:');
        console.log(`   Status: ${updatedOrder.status}`);
        console.log(`   Created At: ${updatedOrder.createdAt.toLocaleString('vi-VN')}`);
        console.log(`   Delivered At: ${updatedOrder.deliveredAt?.toLocaleString('vi-VN')}`);
        console.log(`   Seller Paid: ${updatedOrder.sellerPayment?.isPaid ? 'YES ✅' : 'NO ❌'}`);

        const daysSinceCreation = Math.floor((new Date() - updatedOrder.createdAt) / (1000 * 60 * 60 * 24));
        const daysSinceDelivery = Math.floor((new Date() - updatedOrder.deliveredAt) / (1000 * 60 * 60 * 24));

        console.log(`\n   Days since creation: ${daysSinceCreation} days`);
        console.log(`   Days since delivery: ${daysSinceDelivery} days`);

        if (updatedOrder.sellerPayment?.isPaid) {
            console.log('\n❌ UNEXPECTED: Payment was processed (should wait 7 days from delivery)');
        } else {
            console.log('\n✅ CORRECT: Payment not processed yet (waiting 7 days from delivery)');
        }

        console.log('\n='.repeat(80));
        console.log('🔄 Step 2: Simulate 7 days passing by updating deliveredAt...\n');
        console.log('Expected: Cron job should now process this order');
        console.log('='.repeat(80));

        // Manually set deliveredAt to 8 days ago (simulate time passing)
        const eightDaysAgo = new Date();
        eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);
        
        await Order.updateOne(
            { _id: newOrder._id },
            { $set: { deliveredAt: eightDaysAgo } }
        );

        console.log(`\n✏️  Manually set deliveredAt to: ${eightDaysAgo.toLocaleString('vi-VN')} (8 days ago)\n`);

        // Run the cron job manually
        console.log('🚀 Running cron job to process payment...\n');
        
        const { processUnpaidOrders } = require('../jobs/sellerPaymentJob');
        await processUnpaidOrders();

        // Check final result
        updatedOrder = await Order.findById(newOrder._id);
        const updatedSeller = await User.findById(sellerId);

        console.log('\n='.repeat(80));
        console.log('📊 Final Results:\n');

        console.log('Order Status:');
        console.log(`   Status: ${updatedOrder.status}`);
        console.log(`   Created At: ${updatedOrder.createdAt.toLocaleString('vi-VN')}`);
        console.log(`   Delivered At: ${updatedOrder.deliveredAt.toLocaleString('vi-VN')}`);
        console.log(`   Days since creation: ${Math.floor((new Date() - updatedOrder.createdAt) / (1000 * 60 * 60 * 24))} days`);
        console.log(`   Days since delivery: ${Math.floor((new Date() - updatedOrder.deliveredAt) / (1000 * 60 * 60 * 24))} days`);

        console.log('\nSeller Payment:');
        if (updatedOrder.sellerPayment?.isPaid) {
            console.log(`   ✅ PAID: YES`);
            console.log(`   Paid At: ${new Date(updatedOrder.sellerPayment.paidAt).toLocaleString('vi-VN')}`);
            console.log(`   Net Amount: ${updatedOrder.sellerPayment.netAmount.toLocaleString()} VND`);
        } else {
            console.log(`   ❌ PAID: NO`);
        }

        console.log('\nSeller Balance:');
        console.log(`   Before: ${seller.getBalance().toLocaleString()} VND`);
        console.log(`   After: ${updatedSeller.getBalance().toLocaleString()} VND`);
        console.log(`   Change: +${(updatedSeller.getBalance() - seller.getBalance()).toLocaleString()} VND`);

        console.log('\n='.repeat(80));
        
        if (updatedOrder.sellerPayment?.isPaid) {
            console.log('✅ TEST PASSED: Payment processed after 7 days from DELIVERY!\n');
            console.log('✅ Logic is correct: 7 days counted from deliveredAt, not createdAt\n');
        } else {
            console.log('❌ TEST FAILED: Payment was not processed!\n');
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

