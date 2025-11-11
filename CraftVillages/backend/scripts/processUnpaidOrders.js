/**
 * Process Unpaid Delivered Orders
 * This script finds all DELIVERED orders that haven't been paid to sellers yet
 * and processes payments for them (including old orders)
 * 
 * Usage: node backend/scripts/processUnpaidOrders.js
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Order = require('../models/Order');
const User = require('../models/User');
const PlatformFeeConfig = require('../models/PlatformFeeConfig');
const SellerTransaction = require('../models/SellerTransaction');
const SellerPaymentService = require('../services/sellerPaymentService');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

const processUnpaidOrders = async () => {
    try {
        console.log('\n🔍 Finding all DELIVERED orders that haven\'t been paid to sellers...\n');

        // Find all DELIVERED orders without seller payment
        const unpaidOrders = await Order.find({
            status: 'DELIVERED',
            $or: [
                { 'sellerPayment.isPaid': { $ne: true } },
                { 'sellerPayment': { $exists: false } }
            ]
        }).populate('items.productId').sort({ createdAt: 1 });

        if (unpaidOrders.length === 0) {
            console.log('✅ No unpaid DELIVERED orders found. All orders have been processed!');
            return;
        }

        console.log(`📦 Found ${unpaidOrders.length} unpaid DELIVERED orders\n`);
        console.log('='.repeat(80));

        let successCount = 0;
        let failCount = 0;
        let skippedCount = 0;
        const results = [];

        for (let i = 0; i < unpaidOrders.length; i++) {
            const order = unpaidOrders[i];
            console.log(`\n[${i + 1}/${unpaidOrders.length}] Processing Order: ${order._id}`);
            console.log(`   Order Number: ${order.orderNumber || 'N/A'}`);
            console.log(`   Created: ${new Date(order.createdAt).toLocaleString('vi-VN')}`);
            console.log(`   Amount: ${order.finalAmount.toLocaleString()} VND`);

            try {
                // Check if order has refund request
                const refundCheck = await SellerPaymentService.checkRefundRequest(order._id);
                if (refundCheck.hasRefund) {
                    console.log(`   ⚠️  SKIPPED: Order has active refund request`);
                    skippedCount++;
                    results.push({
                        orderId: order._id,
                        status: 'SKIPPED',
                        reason: 'Has refund request'
                    });
                    continue;
                }

                // Process payment
                const result = await SellerPaymentService.processOrderPayment(order._id);

                if (result.success) {
                    console.log(`   ✅ SUCCESS: Payment processed`);
                    console.log(`      Transaction: ${result.data.transactionCode}`);
                    console.log(`      Gross Amount: ${result.data.grossAmount.toLocaleString()} VND`);
                    console.log(`      Platform Fee: ${result.data.platformFee.toLocaleString()} VND (${result.data.platformFeeRate}%)`);
                    console.log(`      Net Amount: ${result.data.netAmount.toLocaleString()} VND`);
                    console.log(`      Seller: ${result.data.sellerName}`);
                    successCount++;
                    results.push({
                        orderId: order._id,
                        status: 'SUCCESS',
                        transactionCode: result.data.transactionCode,
                        netAmount: result.data.netAmount
                    });
                } else {
                    console.log(`   ⚠️  SKIPPED: ${result.message}`);
                    skippedCount++;
                    results.push({
                        orderId: order._id,
                        status: 'SKIPPED',
                        reason: result.message
                    });
                }
            } catch (error) {
                console.log(`   ❌ ERROR: ${error.message}`);
                failCount++;
                results.push({
                    orderId: order._id,
                    status: 'FAILED',
                    error: error.message
                });
            }
        }

        console.log('\n' + '='.repeat(80));
        console.log('\n📊 SUMMARY:');
        console.log(`   Total orders found: ${unpaidOrders.length}`);
        console.log(`   ✅ Successfully processed: ${successCount}`);
        console.log(`   ⚠️  Skipped: ${skippedCount}`);
        console.log(`   ❌ Failed: ${failCount}`);

        if (successCount > 0) {
            console.log('\n💰 Payment Details:');
            const successResults = results.filter(r => r.status === 'SUCCESS');
            const totalPaid = successResults.reduce((sum, r) => sum + r.netAmount, 0);
            console.log(`   Total amount paid to sellers: ${totalPaid.toLocaleString()} VND`);
            console.log(`   Average per order: ${(totalPaid / successCount).toLocaleString()} VND`);
        }

        if (skippedCount > 0) {
            console.log('\n⚠️  Skipped Orders:');
            results.filter(r => r.status === 'SKIPPED').forEach(r => {
                console.log(`   - ${r.orderId}: ${r.reason}`);
            });
        }

        if (failCount > 0) {
            console.log('\n❌ Failed Orders:');
            results.filter(r => r.status === 'FAILED').forEach(r => {
                console.log(`   - ${r.orderId}: ${r.error}`);
            });
        }

        console.log('\n✅ Processing complete!\n');

    } catch (error) {
        console.error('\n❌ Error processing unpaid orders:', error);
        throw error;
    }
};

const main = async () => {
    try {
        await connectDB();
        await processUnpaidOrders();
    } catch (error) {
        console.error('Fatal error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Database connection closed');
        process.exit(0);
    }
};

main();

