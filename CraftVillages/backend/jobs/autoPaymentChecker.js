/**
 * Auto Payment Checker
 * Automatically checks and processes payments for DELIVERED orders > 7 days
 * Runs every hour to ensure no orders are missed
 */

const cron = require('node-cron');
const Order = require('../models/Order');
const SellerPaymentService = require('../services/sellerPaymentService');

/**
 * Check and process all eligible orders
 */
const checkAndProcessPayments = async () => {
    try {
        console.log('\n💰 [AUTO-PAYMENT] Checking for eligible orders...');
        console.log(`⏰ Time: ${new Date().toLocaleString('vi-VN')}\n`);

        // Calculate 7 days ago
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Find all DELIVERED orders that are > 7 days old and NOT paid yet
        const eligibleOrders = await Order.find({
            status: 'DELIVERED',
            createdAt: { $lte: sevenDaysAgo },
            $or: [
                { 'sellerPayment.isPaid': { $ne: true } },
                { 'sellerPayment': { $exists: false } }
            ]
        }).sort({ createdAt: 1 });

        if (eligibleOrders.length === 0) {
            console.log('✅ No eligible orders found\n');
            return { success: true, processed: 0 };
        }

        console.log(`📦 Found ${eligibleOrders.length} eligible orders\n`);

        let successCount = 0;
        let failedCount = 0;
        let skippedCount = 0;

        for (const order of eligibleOrders) {
            const orderAge = Math.floor((new Date() - order.createdAt) / (1000 * 60 * 60 * 24));

            console.log(`📦 Order: ${order._id} (${orderAge} days old)`);

            // Check if order has refund request
            if (order.hasRefundRequest) {
                console.log(`   ⚠️  SKIPPED: Has refund request\n`);
                skippedCount++;
                continue;
            }

            try {
                // Process payment
                const result = await SellerPaymentService.processOrderPayment(order._id);

                if (result.success) {
                    console.log(`   ✅ PAID: ${result.data.netAmount.toLocaleString()} VND\n`);
                    successCount++;
                } else {
                    console.log(`   ⚠️  SKIPPED: ${result.message}\n`);
                    skippedCount++;
                }
            } catch (error) {
                console.log(`   ❌ ERROR: ${error.message}\n`);
                failedCount++;
            }
        }

        console.log('📊 Summary:');
        console.log(`   ✅ Success: ${successCount}`);
        console.log(`   ⚠️  Skipped: ${skippedCount}`);
        console.log(`   ❌ Failed: ${failedCount}\n`);

        return {
            success: true,
            processed: successCount,
            skipped: skippedCount,
            failed: failedCount
        };

    } catch (error) {
        console.error('❌ [AUTO-PAYMENT] Error:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Initialize auto payment checker
 * Runs every minute for immediate processing
 */
const initializeAutoPaymentChecker = () => {
    // Run immediately on startup
    console.log('🚀 [AUTO-PAYMENT] Running initial check...');
    checkAndProcessPayments();

    // Schedule: Run every minute
    // Cron format: minute hour day month weekday
    // '* * * * *' = Every minute
    const cronSchedule = '* * * * *';

    const job = cron.schedule(cronSchedule, async () => {
        await checkAndProcessPayments();
    }, {
        scheduled: true,
        timezone: "Asia/Ho_Chi_Minh"
    });

    console.log('✅ [AUTO-PAYMENT] Checker initialized');
    console.log(`⏰ Schedule: Every minute (Asia/Ho_Chi_Minh)`);
    console.log(`📅 Cron expression: ${cronSchedule}\n`);

    return job;
};

module.exports = {
    initializeAutoPaymentChecker,
    checkAndProcessPayments
};

