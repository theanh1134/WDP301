/**
 * Test Script for 7-Day Automatic Seller Payment
 * 
 * This script helps test the automatic seller payment system
 * by creating test orders with different ages and scenarios
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Order = require('../models/Order');
const User = require('../models/User');
const { processUnpaidOrders } = require('../jobs/sellerPaymentJob');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected\n');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

/**
 * Display current unpaid orders
 */
const displayUnpaidOrders = async () => {
    console.log('📊 Current Unpaid DELIVERED Orders:\n');
    console.log('='.repeat(100));

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const allDeliveredOrders = await Order.find({
        status: 'DELIVERED',
        $or: [
            { 'sellerPayment.isPaid': { $ne: true } },
            { 'sellerPayment': { $exists: false } }
        ]
    }).sort({ createdAt: 1 });

    if (allDeliveredOrders.length === 0) {
        console.log('✅ No unpaid DELIVERED orders found!\n');
        return;
    }

    console.log(`Total unpaid DELIVERED orders: ${allDeliveredOrders.length}\n`);

    let eligibleCount = 0;
    let waitingCount = 0;

    for (const order of allDeliveredOrders) {
        const orderAge = Math.floor((new Date() - new Date(order.createdAt)) / (1000 * 60 * 60 * 24));
        const isEligible = new Date(order.createdAt) <= sevenDaysAgo;
        const daysRemaining = isEligible ? 0 : 7 - orderAge;

        if (isEligible) {
            eligibleCount++;
            console.log(`✅ ELIGIBLE | Order: ${order._id}`);
        } else {
            waitingCount++;
            console.log(`⏳ WAITING  | Order: ${order._id}`);
        }

        console.log(`   Created: ${new Date(order.createdAt).toLocaleString('vi-VN')} (${orderAge} days ago)`);
        console.log(`   Amount: ${order.finalAmount.toLocaleString()} VND`);
        console.log(`   Status: ${isEligible ? 'Ready for payment' : `Wait ${daysRemaining} more day(s)`}`);
        console.log(`   Has Refund: ${order.hasRefundRequest ? 'Yes ⚠️' : 'No'}`);
        console.log('');
    }

    console.log('='.repeat(100));
    console.log(`\n📈 Summary:`);
    console.log(`   ✅ Eligible for payment (>7 days): ${eligibleCount}`);
    console.log(`   ⏳ Waiting (<7 days): ${waitingCount}`);
    console.log('');
};

/**
 * Create a test order with specific age
 */
const createTestOrder = async (daysOld, sellerId) => {
    try {
        console.log(`\n🔧 Creating test order (${daysOld} days old)...`);

        // Calculate createdAt date
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - daysOld);

        // Get seller info
        const seller = await User.findById(sellerId);
        if (!seller) {
            throw new Error('Seller not found');
        }

        // Create test order
        const testOrder = new Order({
            buyerInfo: {
                userId: new mongoose.Types.ObjectId(),
                fullName: 'Test Buyer'
            },
            shippingAddress: {
                recipientName: 'Test Recipient',
                phoneNumber: '0123456789',
                fullAddress: 'Test Address, Test City'
            },
            items: [{
                productId: new mongoose.Types.ObjectId(),
                productName: 'Test Product',
                thumbnailUrl: '',
                quantity: 1,
                priceAtPurchase: 100000,
                costPriceAtPurchase: 50000
            }],
            paymentInfo: {
                method: 'COD',
                amount: 100000,
                status: 'PAID',
                transactionId: `TEST_TXN_${Date.now()}`,
                paidAt: createdAt
            },
            subtotal: 100000,
            shippingFee: 0,
            tipAmount: 0,
            finalAmount: 100000,
            status: 'DELIVERED',
            createdAt: createdAt,
            updatedAt: createdAt
        });

        await testOrder.save();

        console.log(`✅ Test order created successfully!`);
        console.log(`   Order ID: ${testOrder._id}`);
        console.log(`   Created: ${createdAt.toLocaleString('vi-VN')} (${daysOld} days ago)`);
        console.log(`   Amount: ${testOrder.finalAmount.toLocaleString()} VND`);
        console.log(`   Status: ${testOrder.status}`);

        return testOrder;

    } catch (error) {
        console.error('❌ Error creating test order:', error.message);
        throw error;
    }
};

/**
 * Run the payment job and display results
 */
const runPaymentJob = async () => {
    console.log('\n🚀 Running Seller Payment Job...\n');
    console.log('='.repeat(100));

    await processUnpaidOrders();

    console.log('='.repeat(100));
    console.log('\n✅ Payment job completed!\n');
};

/**
 * Main menu
 */
const showMenu = () => {
    console.log('\n📋 Test Menu:');
    console.log('='.repeat(60));
    console.log('1. Display current unpaid orders');
    console.log('2. Create test order (10 days old) - ELIGIBLE');
    console.log('3. Create test order (5 days old) - NOT ELIGIBLE');
    console.log('4. Run payment job manually');
    console.log('5. Full test scenario');
    console.log('0. Exit');
    console.log('='.repeat(60));
};

/**
 * Full test scenario
 */
const runFullTest = async () => {
    console.log('\n🧪 Running Full Test Scenario...\n');
    console.log('='.repeat(100));

    try {
        // Step 1: Display current state
        console.log('\n📊 STEP 1: Current State');
        await displayUnpaidOrders();

        // Step 2: Get a seller
        const seller = await User.findOne({ role: 'seller' });
        if (!seller) {
            console.log('❌ No seller found in database. Please create a seller first.');
            return;
        }

        console.log(`\n👤 Using seller: ${seller.fullName} (${seller._id})`);
        console.log(`   Current balance: ${seller.getBalance().toLocaleString()} VND`);

        // Step 3: Create test orders
        console.log('\n📦 STEP 2: Creating Test Orders');
        const oldOrder = await createTestOrder(10, seller._id); // Eligible
        const newOrder = await createTestOrder(5, seller._id);  // Not eligible

        // Step 4: Display updated state
        console.log('\n📊 STEP 3: Updated State');
        await displayUnpaidOrders();

        // Step 5: Run payment job
        console.log('\n💰 STEP 4: Running Payment Job');
        await runPaymentJob();

        // Step 6: Verify results
        console.log('\n✅ STEP 5: Verifying Results');
        const updatedOldOrder = await Order.findById(oldOrder._id);
        const updatedNewOrder = await Order.findById(newOrder._id);
        const updatedSeller = await User.findById(seller._id);

        console.log('\nOld Order (10 days):');
        console.log(`   Paid: ${updatedOldOrder.sellerPayment?.isPaid ? '✅ YES' : '❌ NO'}`);
        if (updatedOldOrder.sellerPayment?.isPaid) {
            console.log(`   Net Amount: ${updatedOldOrder.sellerPayment.netAmount.toLocaleString()} VND`);
            console.log(`   Platform Fee: ${updatedOldOrder.sellerPayment.platformFee.toLocaleString()} VND`);
        }

        console.log('\nNew Order (5 days):');
        console.log(`   Paid: ${updatedNewOrder.sellerPayment?.isPaid ? '✅ YES' : '❌ NO (Expected - needs 2 more days)'}`);

        console.log('\nSeller Balance:');
        console.log(`   New balance: ${updatedSeller.getBalance().toLocaleString()} VND`);

        console.log('\n='.repeat(100));
        console.log('✅ Full test completed!\n');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
};

/**
 * Interactive mode
 */
const interactive = async () => {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const askQuestion = (query) => {
        return new Promise(resolve => rl.question(query, resolve));
    };

    let running = true;

    while (running) {
        showMenu();
        const choice = await askQuestion('\nEnter your choice: ');

        switch (choice.trim()) {
            case '1':
                await displayUnpaidOrders();
                break;

            case '2':
                const seller1 = await User.findOne({ role: 'seller' });
                if (seller1) {
                    await createTestOrder(10, seller1._id);
                } else {
                    console.log('❌ No seller found');
                }
                break;

            case '3':
                const seller2 = await User.findOne({ role: 'seller' });
                if (seller2) {
                    await createTestOrder(5, seller2._id);
                } else {
                    console.log('❌ No seller found');
                }
                break;

            case '4':
                await runPaymentJob();
                break;

            case '5':
                await runFullTest();
                break;

            case '0':
                running = false;
                console.log('\n👋 Goodbye!\n');
                break;

            default:
                console.log('\n❌ Invalid choice. Please try again.\n');
        }
    }

    rl.close();
};

/**
 * Main function
 */
const main = async () => {
    try {
        await connectDB();

        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║   7-Day Automatic Seller Payment - Test Script            ║');
        console.log('╚════════════════════════════════════════════════════════════╝');

        // Check command line arguments
        const args = process.argv.slice(2);

        if (args.includes('--full-test')) {
            await runFullTest();
        } else if (args.includes('--display')) {
            await displayUnpaidOrders();
        } else if (args.includes('--run')) {
            await runPaymentJob();
        } else {
            // Interactive mode
            await interactive();
        }

    } catch (error) {
        console.error('Fatal error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Database connection closed');
        process.exit(0);
    }
};

main();

