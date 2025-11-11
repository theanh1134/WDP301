/**
 * Clean orphan SellerTransactions (transactions whose orders no longer exist)
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const SellerTransaction = require('../models/SellerTransaction');
const Order = require('../models/Order');

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
        console.log('║   Clean Orphan SellerTransactions                        ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        // Get all ORDER_PAYMENT transactions
        const transactions = await SellerTransaction.find({
            transactionType: 'ORDER_PAYMENT'
        }).sort({ createdAt: -1 });

        console.log(`📦 Found ${transactions.length} ORDER_PAYMENT transactions\n`);

        let orphanCount = 0;
        let validCount = 0;
        const orphanTransactions = [];

        for (const transaction of transactions) {
            // Check if order exists
            const orderExists = await Order.findById(transaction.orderId);

            if (!orderExists) {
                orphanCount++;
                orphanTransactions.push(transaction);
                console.log(`❌ Orphan: ${transaction.transactionCode}`);
                console.log(`   Order ID: ${transaction.orderId}`);
                console.log(`   Amount: ${(transaction.amount || 0).toLocaleString()} VND`);
                console.log(`   Date: ${new Date(transaction.createdAt).toLocaleString('vi-VN')}\n`);
            } else {
                validCount++;
            }
        }

        console.log('='.repeat(80));
        console.log('📊 SUMMARY:');
        console.log(`   Total transactions: ${transactions.length}`);
        console.log(`   ✅ Valid: ${validCount}`);
        console.log(`   ❌ Orphan: ${orphanCount}\n`);

        if (orphanCount === 0) {
            console.log('✅ No orphan transactions found!\n');
            return;
        }

        // Ask for confirmation
        console.log('⚠️  WARNING: This will DELETE orphan transactions!');
        console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');

        await new Promise(resolve => setTimeout(resolve, 5000));

        console.log('🗑️  Deleting orphan transactions...\n');

        let deletedCount = 0;
        let failedCount = 0;

        for (const transaction of orphanTransactions) {
            try {
                await SellerTransaction.findByIdAndDelete(transaction._id);
                console.log(`✅ Deleted: ${transaction.transactionCode}`);
                deletedCount++;
            } catch (error) {
                console.error(`❌ Failed to delete ${transaction.transactionCode}:`, error.message);
                failedCount++;
            }
        }

        console.log('\n='.repeat(80));
        console.log('📊 DELETION SUMMARY:');
        console.log(`   ✅ Deleted: ${deletedCount}`);
        console.log(`   ❌ Failed: ${failedCount}\n`);

        if (deletedCount > 0) {
            console.log('✅ Orphan transactions cleaned successfully!\n');
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

