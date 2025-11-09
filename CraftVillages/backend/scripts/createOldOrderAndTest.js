/**
 * Create an old order and test instant payment
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

const main = async () => {
    try {
        await connectDB();

        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║   Create Old Order & Test Instant Payment                 ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        // Find any user to use as seller
        const anyUser = await User.findOne();
        if (!anyUser) {
            console.log('❌ No users found in database');
            return;
        }

        console.log(`👤 Using user: ${anyUser.fullName} (${anyUser._id})`);
        console.log(`💰 Balance before: ${anyUser.getBalance().toLocaleString()} VND\n`);

        // Create order 10 days ago
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - 10);

        const testOrder = new Order({
            buyerInfo: {
                userId: new mongoose.Types.ObjectId(),
                fullName: 'Test Buyer - Instant Payment'
            },
            shippingAddress: {
                recipientName: 'Test Recipient',
                phoneNumber: '0123456789',
                fullAddress: 'Test Address, Test City'
            },
            items: [{
                productId: new mongoose.Types.ObjectId(),
                productName: 'Test Product - Instant Payment',
                thumbnailUrl: '',
                quantity: 1,
                priceAtPurchase: 2000000,
                costPriceAtPurchase: 1000000
            }],
            paymentInfo: {
                method: 'COD',
                amount: 2000000,
                status: 'PENDING',
                transactionId: `TEST_INSTANT_${Date.now()}`
            },
            subtotal: 2000000,
            shippingFee: 0,
            tipAmount: 0,
            finalAmount: 2000000,
            status: 'SHIPPED',
            createdAt: createdAt,
            updatedAt: createdAt
        });

        await testOrder.save();

        console.log('📦 Created test order:');
        console.log(`   Order ID: ${testOrder._id}`);
        console.log(`   Created: ${createdAt.toLocaleString('vi-VN')} (10 days ago)`);
        console.log(`   Status: ${testOrder.status}`);
        console.log(`   Amount: ${testOrder.finalAmount.toLocaleString()} VND\n`);

        console.log('='.repeat(80));
        console.log('🔄 Updating status to DELIVERED...\n');
        console.log('Expected: Payment should be processed IMMEDIATELY (order >= 7 days old)');
        console.log('='.repeat(80));

        // Update status to DELIVERED - this should trigger instant payment
        await testOrder.updateStatus('DELIVERED');

        console.log('\n='.repeat(80));
        console.log('📊 Checking results...\n');

        // Reload order
        const updatedOrder = await Order.findById(testOrder._id);
        
        console.log('Order Status:');
        console.log(`   Status: ${updatedOrder.status}`);
        console.log(`   Payment Status: ${updatedOrder.paymentInfo.status}`);
        console.log(`   Payment Paid At: ${updatedOrder.paymentInfo.paidAt?.toLocaleString('vi-VN')}`);

        console.log('\nSeller Payment:');
        if (updatedOrder.sellerPayment?.isPaid) {
            console.log(`   ✅ PAID: YES`);
            console.log(`   Paid At: ${new Date(updatedOrder.sellerPayment.paidAt).toLocaleString('vi-VN')}`);
            console.log(`   Gross Amount: ${updatedOrder.finalAmount.toLocaleString()} VND`);
            console.log(`   Platform Fee (${updatedOrder.sellerPayment.platformFeeRate}%): -${updatedOrder.sellerPayment.platformFee.toLocaleString()} VND`);
            console.log(`   Net Amount: ${updatedOrder.sellerPayment.netAmount.toLocaleString()} VND`);
            console.log(`   Transaction ID: ${updatedOrder.sellerPayment.transactionId}`);
        } else {
            console.log(`   ❌ PAID: NO (This is unexpected!)`);
        }

        // Check user balance
        const updatedUser = await User.findById(anyUser._id);
        console.log('\nUser Balance:');
        console.log(`   Before: ${anyUser.getBalance().toLocaleString()} VND`);
        console.log(`   After: ${updatedUser.getBalance().toLocaleString()} VND`);
        console.log(`   Change: +${(updatedUser.getBalance() - anyUser.getBalance()).toLocaleString()} VND`);

        console.log('\n='.repeat(80));
        
        if (updatedOrder.sellerPayment?.isPaid) {
            console.log('✅ TEST PASSED: Payment processed instantly for old order!\n');
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

