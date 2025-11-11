/**
 * Test Seller Payment System
 * This script demonstrates and tests the automatic seller payment functionality
 * 
 * Usage: node backend/scripts/testSellerPayment.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

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

const testSellerPayment = async () => {
    try {
        console.log('\n🧪 Testing Seller Payment System...\n');

        // 1. Find a DELIVERED order that hasn't been paid yet
        console.log('📦 Step 1: Finding a DELIVERED order...');
        
        const deliveredOrder = await Order.findOne({
            status: 'DELIVERED',
            'sellerPayment.isPaid': { $ne: true }
        }).populate('items.productId');

        if (!deliveredOrder) {
            console.log('⚠️  No unpaid DELIVERED orders found.');
            console.log('💡 Tip: Create an order and update its status to DELIVERED first.');
            return;
        }

        console.log(`✅ Found order: ${deliveredOrder._id}`);
        console.log(`   Order amount: ${deliveredOrder.finalAmount.toLocaleString()} VND`);
        console.log(`   Status: ${deliveredOrder.status}`);

        // 2. Get seller info
        console.log('\n👤 Step 2: Getting seller information...');
        
        const sellerId = await SellerPaymentService.getSellerIdFromOrder(deliveredOrder);
        if (!sellerId) {
            console.log('❌ Cannot determine seller for this order');
            return;
        }

        const seller = await User.findById(sellerId);
        console.log(`✅ Seller: ${seller.fullName} (${seller.email})`);
        console.log(`   Current balance: ${seller.getBalance().toLocaleString()} VND`);

        // 3. Check platform fee configuration
        console.log('\n💰 Step 3: Checking platform fee configuration...');
        
        const feeConfig = await PlatformFeeConfig.findOne({ isActive: true });
        if (!feeConfig) {
            console.log('⚠️  No active platform fee configuration found.');
            console.log('💡 Run: node backend/scripts/initializePlatformFee.js');
            return;
        }

        console.log(`✅ Fee config: ${feeConfig.name}`);
        console.log(`   Type: ${feeConfig.feeType}`);
        console.log(`   Rate: ${feeConfig.formattedRate}`);

        // Calculate expected fee
        const feeCalculation = feeConfig.calculateFee(deliveredOrder.finalAmount);
        console.log(`\n📊 Fee Calculation:`);
        console.log(`   Gross Amount: ${deliveredOrder.finalAmount.toLocaleString()} VND`);
        console.log(`   Platform Fee: ${feeCalculation.feeAmount.toLocaleString()} VND (${feeCalculation.feeRate}%)`);
        console.log(`   Net Amount: ${feeCalculation.netAmount.toLocaleString()} VND`);
        console.log(`   Expected seller balance after: ${(seller.getBalance() + feeCalculation.netAmount).toLocaleString()} VND`);

        // 4. Ask for confirmation
        console.log('\n⚠️  Step 4: Ready to process payment');
        console.log('   This will:');
        console.log(`   - Add ${feeCalculation.netAmount.toLocaleString()} VND to seller balance`);
        console.log(`   - Create a transaction record`);
        console.log(`   - Mark order as paid`);
        
        // In a real test, you might want to add a confirmation prompt here
        // For now, we'll proceed automatically
        
        console.log('\n🚀 Step 5: Processing seller payment...\n');
        console.log('='.repeat(60));

        // 5. Process payment
        const result = await SellerPaymentService.processOrderPayment(deliveredOrder._id);

        console.log('='.repeat(60));
        console.log('\n📋 Payment Result:\n');

        if (result.success) {
            console.log('✅ SUCCESS! Seller payment processed.');
            console.log('\n📊 Payment Details:');
            console.log(`   Transaction Code: ${result.data.transactionCode}`);
            console.log(`   Order ID: ${result.data.orderId}`);
            console.log(`   Seller ID: ${result.data.sellerId}`);
            console.log(`   Gross Amount: ${result.data.grossAmount.toLocaleString()} VND`);
            console.log(`   Platform Fee: ${result.data.platformFee.toLocaleString()} VND (${result.data.platformFeeRate}%)`);
            console.log(`   Net Amount: ${result.data.netAmount.toLocaleString()} VND`);
            console.log(`\n💰 Seller Balance:`);
            console.log(`   Before: ${result.data.sellerBalanceBefore.toLocaleString()} VND`);
            console.log(`   After: ${result.data.sellerBalanceAfter.toLocaleString()} VND`);
            console.log(`   Change: +${result.data.netAmount.toLocaleString()} VND`);

            // 6. Verify transaction record
            console.log('\n🔍 Step 6: Verifying transaction record...');
            
            const transaction = await SellerTransaction.findById(result.data.transactionId)
                .populate('sellerId', 'fullName email')
                .populate('orderId', 'orderNumber finalAmount');

            if (transaction) {
                console.log('✅ Transaction record found:');
                console.log(`   Code: ${transaction.transactionCode}`);
                console.log(`   Type: ${transaction.transactionType}`);
                console.log(`   Status: ${transaction.status}`);
                console.log(`   Created: ${transaction.createdAt.toISOString()}`);
            }

            // 7. Verify order update
            console.log('\n🔍 Step 7: Verifying order update...');
            
            const updatedOrder = await Order.findById(deliveredOrder._id);
            if (updatedOrder.sellerPayment && updatedOrder.sellerPayment.isPaid) {
                console.log('✅ Order marked as paid:');
                console.log(`   Paid At: ${updatedOrder.sellerPayment.paidAt.toISOString()}`);
                console.log(`   Transaction ID: ${updatedOrder.sellerPayment.transactionId}`);
                console.log(`   Platform Fee: ${updatedOrder.sellerPayment.platformFee.toLocaleString()} VND`);
                console.log(`   Net Amount: ${updatedOrder.sellerPayment.netAmount.toLocaleString()} VND`);
            }

            console.log('\n✨ Test completed successfully!');

        } else {
            console.log('❌ FAILED! Payment not processed.');
            console.log(`   Reason: ${result.message}`);
            
            if (result.hasRefund) {
                console.log(`   Refund ID: ${result.refundId}`);
                console.log('   💡 This order has a refund request, payment is blocked.');
            } else if (result.alreadyPaid) {
                console.log('   💡 This order was already paid.');
            }
        }

    } catch (error) {
        console.error('\n❌ Test failed with error:', error);
        throw error;
    }
};

const testFeeCalculation = async () => {
    try {
        console.log('\n🧮 Testing Fee Calculation...\n');

        const feeConfig = await PlatformFeeConfig.findOne({ isActive: true });
        if (!feeConfig) {
            console.log('⚠️  No active platform fee configuration found.');
            return;
        }

        console.log(`📋 Using config: ${feeConfig.name} (${feeConfig.formattedRate})\n`);

        const testAmounts = [
            10000,    // 10k
            50000,    // 50k
            100000,   // 100k
            500000,   // 500k
            1000000,  // 1M
            5000000,  // 5M
            10000000  // 10M
        ];

        console.log('Amount'.padEnd(15) + 'Platform Fee'.padEnd(20) + 'Seller Gets'.padEnd(20) + 'Fee %');
        console.log('-'.repeat(75));

        for (const amount of testAmounts) {
            const calc = feeConfig.calculateFee(amount);
            console.log(
                `${amount.toLocaleString()} VND`.padEnd(15) +
                `${calc.feeAmount.toLocaleString()} VND`.padEnd(20) +
                `${calc.netAmount.toLocaleString()} VND`.padEnd(20) +
                `${calc.feeRate}%`
            );
        }

        console.log('\n✅ Fee calculation test completed!');

    } catch (error) {
        console.error('\n❌ Fee calculation test failed:', error);
        throw error;
    }
};

const main = async () => {
    try {
        await connectDB();

        // Run tests
        await testFeeCalculation();
        console.log('\n' + '='.repeat(80) + '\n');
        await testSellerPayment();

        console.log('\n✅ All tests completed!');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Tests failed:', error);
        process.exit(1);
    }
};

main();

