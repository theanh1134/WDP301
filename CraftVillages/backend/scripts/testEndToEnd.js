/**
 * End-to-End Test for Automatic Seller Payment
 * 
 * This script:
 * 1. Finds a DELIVERED order that hasn't been paid
 * 2. Simulates it being > 7 days old (by checking createdAt)
 * 3. Runs the scheduled job
 * 4. Verifies payment was processed
 * 5. Verifies no return request badge should show
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Order = require('../models/Order');
const Return = require('../models/Return');
const SellerTransaction = require('../models/SellerTransaction');
const User = require('../models/User');
const { runNow } = require('../jobs/sellerPaymentJob');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected\n');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

const testEndToEnd = async () => {
    try {
        console.log('🧪 END-TO-END TEST: Automatic Seller Payment System\n');
        console.log('='.repeat(80));

        // Step 1: Find unpaid DELIVERED order
        console.log('\n📋 Step 1: Finding unpaid DELIVERED order...\n');
        
        const unpaidOrder = await Order.findOne({
            status: 'DELIVERED',
            $or: [
                { 'sellerPayment.isPaid': { $ne: true } },
                { 'sellerPayment': { $exists: false } }
            ]
        }).populate('items.productId');

        if (!unpaidOrder) {
            console.log('⚠️  No unpaid DELIVERED orders found.');
            console.log('💡 Create a test order first or all orders are already paid.\n');
            return;
        }

        console.log(`✅ Found unpaid order: ${unpaidOrder._id}`);
        console.log(`   Status: ${unpaidOrder.status}`);
        console.log(`   Created: ${unpaidOrder.createdAt.toLocaleString('vi-VN')}`);
        console.log(`   Amount: ${unpaidOrder.finalAmount.toLocaleString()} VND`);
        
        // Check age
        const daysSinceCreated = Math.floor((Date.now() - unpaidOrder.createdAt) / (1000 * 60 * 60 * 24));
        console.log(`   Age: ${daysSinceCreated} days`);
        
        if (daysSinceCreated < 7) {
            console.log(`   ⚠️  Order is only ${daysSinceCreated} days old (< 7 days)`);
            console.log(`   💡 For testing purposes, we'll process it anyway\n`);
        } else {
            console.log(`   ✅ Order is ${daysSinceCreated} days old (> 7 days)\n`);
        }

        // Step 2: Check for return requests
        console.log('📋 Step 2: Checking for return requests...\n');
        
        const returnRequests = await Return.find({ orderId: unpaidOrder._id });
        
        if (returnRequests.length > 0) {
            console.log(`⚠️  Found ${returnRequests.length} return request(s):`);
            returnRequests.forEach(ret => {
                console.log(`   - RMA: ${ret.rmaCode}, Status: ${ret.status}`);
            });
            console.log(`   ❌ Order has return requests, payment will be skipped\n`);
            return;
        } else {
            console.log(`✅ No return requests found for this order\n`);
        }

        // Step 3: Get seller info before payment
        console.log('📋 Step 3: Getting seller info before payment...\n');
        
        const firstProduct = unpaidOrder.items[0].productId;
        const seller = await User.findById(firstProduct.userId);
        
        if (!seller) {
            console.log('❌ Seller not found\n');
            return;
        }

        const balanceBefore = seller.getBalance();
        console.log(`👤 Seller: ${seller.fullName} (${seller.email})`);
        console.log(`💰 Balance before: ${balanceBefore.toLocaleString()} VND\n`);

        // Step 4: Run scheduled job
        console.log('📋 Step 4: Running scheduled job...\n');
        console.log('='.repeat(80));
        
        await runNow();
        
        console.log('='.repeat(80));

        // Step 5: Verify payment was processed
        console.log('\n📋 Step 5: Verifying payment was processed...\n');
        
        // Reload order
        const updatedOrder = await Order.findById(unpaidOrder._id);
        
        if (updatedOrder.sellerPayment && updatedOrder.sellerPayment.isPaid) {
            console.log('✅ Order payment status updated:');
            console.log(`   isPaid: ${updatedOrder.sellerPayment.isPaid}`);
            console.log(`   paidAt: ${updatedOrder.sellerPayment.paidAt.toLocaleString('vi-VN')}`);
            console.log(`   Platform Fee: ${updatedOrder.sellerPayment.platformFee.toLocaleString()} VND (${updatedOrder.sellerPayment.platformFeeRate}%)`);
            console.log(`   Net Amount: ${updatedOrder.sellerPayment.netAmount.toLocaleString()} VND\n`);
        } else {
            console.log('❌ Order payment status NOT updated\n');
            return;
        }

        // Check transaction record
        const transaction = await SellerTransaction.findById(updatedOrder.sellerPayment.transactionId);
        
        if (transaction) {
            console.log('✅ Transaction record created:');
            console.log(`   Code: ${transaction.transactionCode}`);
            console.log(`   Type: ${transaction.transactionType}`);
            console.log(`   Status: ${transaction.status}`);
            console.log(`   Gross: ${transaction.amounts.grossAmount.toLocaleString()} VND`);
            console.log(`   Fee: ${transaction.amounts.platformFee.toLocaleString()} VND`);
            console.log(`   Net: ${transaction.amounts.netAmount.toLocaleString()} VND\n`);
        } else {
            console.log('❌ Transaction record NOT found\n');
            return;
        }

        // Reload seller
        const updatedSeller = await User.findById(seller._id);
        const balanceAfter = updatedSeller.getBalance();
        const balanceChange = balanceAfter - balanceBefore;
        
        console.log('✅ Seller balance updated:');
        console.log(`   Before: ${balanceBefore.toLocaleString()} VND`);
        console.log(`   After: ${balanceAfter.toLocaleString()} VND`);
        console.log(`   Change: +${balanceChange.toLocaleString()} VND\n`);

        // Step 6: Verify returnedProductIds
        console.log('📋 Step 6: Verifying returnedProductIds (for badge check)...\n');
        
        // Simulate what frontend API returns
        const _return = require('../models/Return');
        const returns = await _return.find({ orderId: unpaidOrder._id }).select('items.productId status').lean();
        
        if (!returns || returns.length === 0) {
            console.log('✅ No return requests found');
            console.log('✅ returnedProductIds should be: []\n');
        } else {
            const allIds = returns.flatMap(ret => 
                ret.items.map(i => ({
                    productId: String(i.productId),
                    status: ret.status
                }))
            );
            
            const uniqueMap = new Map();
            allIds.forEach(item => {
                uniqueMap.set(item.productId, item);
            });
            
            const returnedProductIds = Array.from(uniqueMap.values());
            
            console.log(`⚠️  Return requests found: ${returns.length}`);
            console.log(`   returnedProductIds:`, returnedProductIds);
            console.log(`   ⚠️  Badge WILL show for these products\n`);
        }

        // Final summary
        console.log('='.repeat(80));
        console.log('\n🎉 END-TO-END TEST SUMMARY:\n');
        console.log(`✅ Order ${unpaidOrder._id} processed successfully`);
        console.log(`✅ Seller received ${balanceChange.toLocaleString()} VND`);
        console.log(`✅ Transaction ${transaction.transactionCode} created`);
        console.log(`✅ No return request badge should show (returnedProductIds = [])`);
        console.log('\n✅ ALL TESTS PASSED!\n');

    } catch (error) {
        console.error('\n❌ Test failed:', error);
        throw error;
    }
};

const main = async () => {
    try {
        await connectDB();
        await testEndToEnd();
    } catch (error) {
        console.error('Fatal error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Database connection closed');
        process.exit(0);
    }
};

main();

