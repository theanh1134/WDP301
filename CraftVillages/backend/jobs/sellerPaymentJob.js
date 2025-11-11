/**
 * Seller Payment Scheduled Job
 * Automatically processes seller payments for DELIVERED orders that are older than 7 days
 * This ensures buyers have enough time to request returns/refunds
 * Runs every day at 2:00 AM (Asia/Ho_Chi_Minh timezone)
 *
 * NOTE: 7 days is calculated from createdAt (when order was created)
 */

const cron = require('node-cron');
const Order = require('../models/Order');
const SellerPaymentService = require('../services/sellerPaymentService');

/**
 * Process all unpaid DELIVERED orders that are older than 7 days (from creation date)
 */
const processUnpaidOrders = async () => {
    try {
        console.log('\n🔄 [CRON JOB] Starting automatic seller payment processing...');
        console.log(`⏰ Time: ${new Date().toLocaleString('vi-VN')}\n`);

        // Calculate date 7 days ago
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        console.log(`📅 Processing orders CREATED before: ${sevenDaysAgo.toLocaleString('vi-VN')}`);
        console.log(`   (Orders must be created at least 7 days ago)\n`);

        // Find all DELIVERED orders without seller payment that were created more than 7 days ago
        const unpaidOrders = await Order.find({
            status: 'DELIVERED',
            createdAt: { $lte: sevenDaysAgo }, // Created more than 7 days ago
            $or: [
                { 'sellerPayment.isPaid': { $ne: true } },
                { 'sellerPayment': { $exists: false } }
            ]
        }).populate('items.productId').sort({ createdAt: 1 });

        if (unpaidOrders.length === 0) {
            console.log('✅ No unpaid DELIVERED orders (>7 days old) found. All orders have been processed!');
            return;
        }

        console.log(`📦 Found ${unpaidOrders.length} unpaid DELIVERED orders (>7 days old)\n`);

        let successCount = 0;
        let failCount = 0;
        let skippedCount = 0;

        for (let i = 0; i < unpaidOrders.length; i++) {
            const order = unpaidOrders[i];
            const daysSinceCreation = Math.floor((new Date() - new Date(order.createdAt)) / (1000 * 60 * 60 * 24));

            console.log(`[${i + 1}/${unpaidOrders.length}] Processing Order: ${order._id}`);
            console.log(`   Created: ${new Date(order.createdAt).toLocaleString('vi-VN')} (${daysSinceCreation} days ago)`);

            try {
                // Check if order has refund request
                const refundCheck = await SellerPaymentService.checkRefundRequest(order._id);
                if (refundCheck.hasRefund) {
                    console.log(`   ⚠️  SKIPPED: Order has active refund request`);
                    skippedCount++;
                    continue;
                }

                // Process payment
                const result = await SellerPaymentService.processOrderPayment(order._id);

                if (result.success) {
                    console.log(`   ✅ SUCCESS: ${result.data.transactionCode} - ${result.data.netAmount.toLocaleString()} VND`);
                    successCount++;
                } else {
                    console.log(`   ⚠️  SKIPPED: ${result.message}`);
                    skippedCount++;
                }
            } catch (error) {
                console.log(`   ❌ ERROR: ${error.message}`);
                failCount++;
            }
        }

        console.log('\n📊 SUMMARY:');
        console.log(`   Total: ${unpaidOrders.length} | ✅ Success: ${successCount} | ⚠️  Skipped: ${skippedCount} | ❌ Failed: ${failCount}`);
        console.log(`✅ [CRON JOB] Automatic seller payment processing completed!\n`);

    } catch (error) {
        console.error('\n❌ [CRON JOB] Error processing unpaid orders:', error);
    }
};

/**
 * Initialize scheduled job
 * Runs every day at 2:00 AM
 */
const initializeSellerPaymentJob = () => {
    // Schedule: Run every day at 2:00 AM
    // Cron format: minute hour day month weekday
    // '0 2 * * *' = At 02:00 every day
    const cronSchedule = '0 2 * * *';

    const job = cron.schedule(cronSchedule, async () => {
        await processUnpaidOrders();
    }, {
        scheduled: true,
        timezone: "Asia/Ho_Chi_Minh"
    });

    console.log('✅ Seller Payment Job initialized');
    console.log(`⏰ Schedule: Every day at 2:00 AM (Asia/Ho_Chi_Minh)`);
    console.log(`📅 Cron expression: ${cronSchedule}\n`);

    return job;
};

/**
 * Run job immediately (for testing)
 */
const runNow = async () => {
    console.log('🚀 Running seller payment job immediately...\n');
    await processUnpaidOrders();
};

module.exports = {
    initializeSellerPaymentJob,
    processUnpaidOrders,
    runNow
};

