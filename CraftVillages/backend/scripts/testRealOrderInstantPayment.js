/**
 * Test instant payment with a real order structure
 * Clone an existing DELIVERED order and test the instant payment logic
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
        console.log('║   Test Instant Payment with Real Order                    ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        // Find an existing DELIVERED order that has been paid
        const existingOrder = await Order.findOne({
            status: 'DELIVERED',
            'sellerPayment.isPaid': true
        }).populate('items.productId');

        if (!existingOrder) {
            console.log('❌ No existing DELIVERED order found to clone');
            console.log('   Please create an order first or use an existing one');
            return;
        }

        console.log(`📦 Found existing order to clone: ${existingOrder._id}`);
        console.log(`   Amount: ${existingOrder.finalAmount.toLocaleString()} VND\n`);

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

        // Create a new order 10 days ago (clone from existing)
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - 10);

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
                transactionId: `TEST_INSTANT_${Date.now()}`
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
        console.log(`   Created: ${createdAt.toLocaleString('vi-VN')} (10 days ago)`);
        console.log(`   Status: ${newOrder.status}`);
        console.log(`   Amount: ${newOrder.finalAmount.toLocaleString()} VND\n`);

        console.log('='.repeat(80));
        console.log('🔄 Updating status to DELIVERED...\n');
        console.log('Expected: Payment should be processed IMMEDIATELY (order >= 7 days old)');
        console.log('='.repeat(80));

        // Update status to DELIVERED - this should trigger instant payment
        await newOrder.updateStatus('DELIVERED');

        console.log('\n='.repeat(80));
        console.log('📊 Checking results...\n');

        // Reload order
        const updatedOrder = await Order.findById(newOrder._id);
        
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

        // Check seller balance
        const updatedSeller = await User.findById(sellerId);
        console.log('\nSeller Balance:');
        console.log(`   Before: ${seller.getBalance().toLocaleString()} VND`);
        console.log(`   After: ${updatedSeller.getBalance().toLocaleString()} VND`);
        console.log(`   Change: +${(updatedSeller.getBalance() - seller.getBalance()).toLocaleString()} VND`);

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

