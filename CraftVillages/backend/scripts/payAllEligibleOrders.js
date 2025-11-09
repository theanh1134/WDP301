/**
 * Pay all orders that are DELIVERED and createdAt > 7 days
 * This will process ALL eligible orders in one go
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Order = require('../models/Order');
const SellerPaymentService = require('../services/sellerPaymentService');

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
        console.log('║   Pay All Eligible Orders (DELIVERED + >7 days)          ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        // Calculate 7 days ago
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        console.log(`📅 Processing orders CREATED before: ${sevenDaysAgo.toLocaleString('vi-VN')}`);
        console.log(`   (Orders must be created at least 7 days ago)\n`);

        // Find all DELIVERED orders that are > 7 days old and NOT paid yet
        const eligibleOrders = await Order.find({
            status: 'DELIVERED',
            createdAt: { $lte: sevenDaysAgo },
            $or: [
                { 'sellerPayment.isPaid': { $ne: true } },
                { 'sellerPayment': { $exists: false } }
            ]
        }).sort({ createdAt: 1 });

        console.log(`📦 Found ${eligibleOrders.length} eligible orders\n`);

        if (eligibleOrders.length === 0) {
            console.log('✅ No orders to process!\n');
            return;
        }

        let successCount = 0;
        let failedCount = 0;
        let skippedCount = 0;
        let totalPaid = 0;

        console.log('='.repeat(80));

        for (let i = 0; i < eligibleOrders.length; i++) {
            const order = eligibleOrders[i];
            const orderAge = Math.floor((new Date() - order.createdAt) / (1000 * 60 * 60 * 24));

            console.log(`\n[${i + 1}/${eligibleOrders.length}] Processing Order: ${order._id}`);
            console.log(`   Created: ${order.createdAt.toLocaleString('vi-VN')} (${orderAge} days ago)`);
            console.log(`   Amount: ${order.finalAmount.toLocaleString()} VND`);

            // Check if order has refund request
            if (order.hasRefundRequest) {
                console.log(`   ⚠️  SKIPPED: Order has active refund request`);
                skippedCount++;
                continue;
            }

            try {
                // Process payment
                const result = await SellerPaymentService.processOrderPayment(order._id);

                if (result.success) {
                    console.log(`   ✅ SUCCESS: ${result.data.transactionCode} - ${result.data.netAmount.toLocaleString()} VND`);
                    successCount++;
                    totalPaid += result.data.netAmount;
                } else {
                    console.log(`   ⚠️  SKIPPED: ${result.message}`);
                    skippedCount++;
                }
            } catch (error) {
                console.log(`   ❌ ERROR: ${error.message}`);
                failedCount++;
            }
        }

        console.log('\n' + '='.repeat(80));
        console.log('\n📊 SUMMARY:');
        console.log(`   Total: ${eligibleOrders.length}`);
        console.log(`   ✅ Success: ${successCount}`);
        console.log(`   ⚠️  Skipped: ${skippedCount}`);
        console.log(`   ❌ Failed: ${failedCount}`);
        console.log(`   💰 Total Paid: ${totalPaid.toLocaleString()} VND\n`);

        if (successCount > 0) {
            console.log('✅ Payment processing completed!\n');
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

