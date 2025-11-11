/**
 * Test the createdAt logic (7 days from order creation)
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
        console.log('║   Test createdAt Logic (7 days from order creation)      ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        // Find an existing DELIVERED order
        const existingOrder = await Order.findOne({
            status: 'DELIVERED',
            'sellerPayment.isPaid': true
        }).populate('items.productId');

        if (!existingOrder) {
            console.log('❌ No existing DELIVERED order found');
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

        // Create order 10 days ago
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

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
                transactionId: `TEST_CREATED_AT_${Date.now()}`
            },
            subtotal: existingOrder.subtotal,
            shippingFee: existingOrder.shippingFee,
            tipAmount: existingOrder.tipAmount,
            finalAmount: existingOrder.finalAmount,
            status: 'SHIPPED',
            createdAt: tenDaysAgo,
            updatedAt: tenDaysAgo
        });

        await newOrder.save();

        console.log('📦 Created test order:');
        console.log(`   Order ID: ${newOrder._id}`);
        console.log(`   Created: ${tenDaysAgo.toLocaleString('vi-VN')} (10 days ago)`);
        console.log(`   Status: ${newOrder.status}`);
        console.log(`   Amount: ${newOrder.finalAmount.toLocaleString()} VND\n`);

        console.log('='.repeat(80));
        console.log('🔄 Marking as DELIVERED today...\n');
        console.log('Expected: Order is 10 days old, should be eligible for payment');
        console.log('='.repeat(80));

        // Mark as DELIVERED
        await newOrder.updateStatus('DELIVERED');

        console.log('\n📊 After marking as DELIVERED:\n');

        const updatedOrder = await Order.findById(newOrder._id);
        const daysSinceCreation = Math.floor((new Date() - updatedOrder.createdAt) / (1000 * 60 * 60 * 24));

        console.log(`   Status: ${updatedOrder.status}`);
        console.log(`   Created: ${updatedOrder.createdAt.toLocaleString('vi-VN')}`);
        console.log(`   Days since creation: ${daysSinceCreation} days`);
        console.log(`   Seller Paid: ${updatedOrder.sellerPayment?.isPaid ? 'YES' : 'NO'}\n`);

        console.log('='.repeat(80));
        console.log('🔄 Running payment job...\n');
        console.log('Expected: Order should be processed (>7 days old)');
        console.log('='.repeat(80));

        // Run payment job
        const { processUnpaidOrders } = require('../jobs/sellerPaymentJob');
        await processUnpaidOrders();

        // Check result
        const finalOrder = await Order.findById(newOrder._id);
        const finalSeller = await User.findById(sellerId);

        console.log('\n='.repeat(80));
        console.log('📊 Final Results:\n');

        console.log('Order Status:');
        console.log(`   Status: ${finalOrder.status}`);
        console.log(`   Created: ${finalOrder.createdAt.toLocaleString('vi-VN')}`);
        console.log(`   Days old: ${Math.floor((new Date() - finalOrder.createdAt) / (1000 * 60 * 60 * 24))} days`);

        console.log('\nSeller Payment:');
        if (finalOrder.sellerPayment?.isPaid) {
            console.log(`   ✅ PAID: YES`);
            console.log(`   Paid At: ${new Date(finalOrder.sellerPayment.paidAt).toLocaleString('vi-VN')}`);
            console.log(`   Net Amount: ${finalOrder.sellerPayment.netAmount.toLocaleString()} VND`);
        } else {
            console.log(`   ❌ PAID: NO`);
        }

        console.log('\nSeller Balance:');
        console.log(`   Before: ${seller.getBalance().toLocaleString()} VND`);
        console.log(`   After: ${finalSeller.getBalance().toLocaleString()} VND`);
        console.log(`   Change: +${(finalSeller.getBalance() - seller.getBalance()).toLocaleString()} VND`);

        console.log('\n='.repeat(80));
        
        if (finalOrder.sellerPayment?.isPaid) {
            console.log('✅ TEST PASSED: Payment processed for order >7 days old!\n');
            console.log('✅ Logic is correct: 7 days counted from createdAt\n');
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

