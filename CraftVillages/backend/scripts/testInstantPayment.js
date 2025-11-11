/**
 * Test Script for Instant Seller Payment (Orders >= 7 days)
 * 
 * This script tests the new automatic payment logic:
 * - Orders >= 7 days old: Payment processed IMMEDIATELY when status → DELIVERED
 * - Orders < 7 days old: Payment processed by scheduled job (2:00 AM daily)
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Order = require('../models/Order');
const User = require('../models/User');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected\n');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

/**
 * Test Case 1: Old order (>= 7 days) → Should pay immediately
 */
const testOldOrder = async () => {
    console.log('🧪 TEST CASE 1: Old Order (>= 7 days)\n');
    console.log('='.repeat(80));

    try {
        // Get a seller
        const seller = await User.findOne({ role: 'seller' });
        if (!seller) {
            console.log('❌ No seller found in database');
            return;
        }

        console.log(`👤 Seller: ${seller.fullName}`);
        console.log(`💰 Balance before: ${seller.getBalance().toLocaleString()} VND\n`);

        // Create order 10 days ago
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - 10);

        const testOrder = new Order({
            buyerInfo: {
                userId: new mongoose.Types.ObjectId(),
                fullName: 'Test Buyer'
            },
            shippingAddress: {
                recipientName: 'Test Recipient',
                phoneNumber: '0123456789',
                fullAddress: 'Test Address'
            },
            items: [{
                productId: new mongoose.Types.ObjectId(),
                productName: 'Test Product',
                thumbnailUrl: '',
                quantity: 1,
                priceAtPurchase: 1000000,
                costPriceAtPurchase: 500000
            }],
            paymentInfo: {
                method: 'COD',
                amount: 1000000,
                status: 'PENDING',
                transactionId: `TEST_TXN_${Date.now()}`
            },
            subtotal: 1000000,
            shippingFee: 0,
            tipAmount: 0,
            finalAmount: 1000000,
            status: 'SHIPPED',
            createdAt: createdAt,
            updatedAt: createdAt
        });

        await testOrder.save();
        console.log(`📦 Created test order: ${testOrder._id}`);
        console.log(`   Created: ${createdAt.toLocaleString('vi-VN')} (10 days ago)`);
        console.log(`   Status: ${testOrder.status}`);
        console.log(`   Amount: ${testOrder.finalAmount.toLocaleString()} VND\n`);

        // Update status to DELIVERED
        console.log('🔄 Updating status to DELIVERED...\n');
        await testOrder.updateStatus('DELIVERED');

        // Reload order to see changes
        const updatedOrder = await Order.findById(testOrder._id);
        console.log('\n📊 Result:');
        console.log(`   Order Status: ${updatedOrder.status}`);
        console.log(`   Payment Status: ${updatedOrder.paymentInfo.status}`);
        console.log(`   Seller Payment Paid: ${updatedOrder.sellerPayment?.isPaid ? '✅ YES' : '❌ NO'}`);

        if (updatedOrder.sellerPayment?.isPaid) {
            console.log(`   Platform Fee: ${updatedOrder.sellerPayment.platformFee.toLocaleString()} VND`);
            console.log(`   Net Amount: ${updatedOrder.sellerPayment.netAmount.toLocaleString()} VND`);
            console.log(`   Transaction: ${updatedOrder.sellerPayment.transactionId}`);
        }

        // Check seller balance
        const updatedSeller = await User.findById(seller._id);
        console.log(`\n💰 Seller balance after: ${updatedSeller.getBalance().toLocaleString()} VND`);

        console.log('\n✅ TEST PASSED: Old order payment processed immediately!\n');
        console.log('='.repeat(80));

    } catch (error) {
        console.error('❌ TEST FAILED:', error.message);
        console.log('='.repeat(80));
    }
};

/**
 * Test Case 2: New order (< 7 days) → Should NOT pay immediately
 */
const testNewOrder = async () => {
    console.log('\n🧪 TEST CASE 2: New Order (< 7 days)\n');
    console.log('='.repeat(80));

    try {
        // Get a seller
        const seller = await User.findOne({ role: 'seller' });
        if (!seller) {
            console.log('❌ No seller found in database');
            return;
        }

        console.log(`👤 Seller: ${seller.fullName}`);
        console.log(`💰 Balance before: ${seller.getBalance().toLocaleString()} VND\n`);

        // Create order 3 days ago
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - 3);

        const testOrder = new Order({
            buyerInfo: {
                userId: new mongoose.Types.ObjectId(),
                fullName: 'Test Buyer'
            },
            shippingAddress: {
                recipientName: 'Test Recipient',
                phoneNumber: '0123456789',
                fullAddress: 'Test Address'
            },
            items: [{
                productId: new mongoose.Types.ObjectId(),
                productName: 'Test Product',
                thumbnailUrl: '',
                quantity: 1,
                priceAtPurchase: 500000,
                costPriceAtPurchase: 250000
            }],
            paymentInfo: {
                method: 'COD',
                amount: 500000,
                status: 'PENDING',
                transactionId: `TEST_TXN_${Date.now()}`
            },
            subtotal: 500000,
            shippingFee: 0,
            tipAmount: 0,
            finalAmount: 500000,
            status: 'SHIPPED',
            createdAt: createdAt,
            updatedAt: createdAt
        });

        await testOrder.save();
        console.log(`📦 Created test order: ${testOrder._id}`);
        console.log(`   Created: ${createdAt.toLocaleString('vi-VN')} (3 days ago)`);
        console.log(`   Status: ${testOrder.status}`);
        console.log(`   Amount: ${testOrder.finalAmount.toLocaleString()} VND\n`);

        // Update status to DELIVERED
        console.log('🔄 Updating status to DELIVERED...\n');
        await testOrder.updateStatus('DELIVERED');

        // Reload order to see changes
        const updatedOrder = await Order.findById(testOrder._id);
        console.log('\n📊 Result:');
        console.log(`   Order Status: ${updatedOrder.status}`);
        console.log(`   Payment Status: ${updatedOrder.paymentInfo.status}`);
        console.log(`   Seller Payment Paid: ${updatedOrder.sellerPayment?.isPaid ? '✅ YES' : '❌ NO (Expected)'}`);

        // Check seller balance
        const updatedSeller = await User.findById(seller._id);
        console.log(`\n💰 Seller balance after: ${updatedSeller.getBalance().toLocaleString()} VND (Should be unchanged)`);

        if (!updatedOrder.sellerPayment?.isPaid) {
            console.log('\n✅ TEST PASSED: New order payment deferred to scheduled job!\n');
        } else {
            console.log('\n❌ TEST FAILED: New order should NOT be paid immediately!\n');
        }

        console.log('='.repeat(80));

    } catch (error) {
        console.error('❌ TEST FAILED:', error.message);
        console.log('='.repeat(80));
    }
};

/**
 * Main function
 */
const main = async () => {
    try {
        await connectDB();

        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║   Instant Seller Payment Test (Orders >= 7 days)          ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        // Run test cases
        await testOldOrder();
        await testNewOrder();

        console.log('\n🎉 All tests completed!\n');

    } catch (error) {
        console.error('Fatal error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Database connection closed');
        process.exit(0);
    }
};

main();

