/**
 * Simple test: Create old order and mark as DELIVERED
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
        console.log('║   Test Auto Payment When Status → DELIVERED              ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        // Find a valid product and seller
        const product = await Product.findOne();
        if (!product || !product.shopId) {
            console.log('❌ No valid product/seller found');
            return;
        }

        const seller = await User.findById(product.shopId);
        console.log(`👤 Seller: ${seller.fullName} (${seller.email})`);
        console.log(`💰 Current Balance: ${(seller.balance || 0).toLocaleString()} VND\n`);

        // Create a test order that is 10 days old
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

        const testOrder = new Order({
            buyerInfo: {
                userId: seller._id, // Use seller as buyer for testing
                fullName: 'Test Buyer',
                email: 'test@test.com',
                phone: '0123456789'
            },
            shippingAddress: {
                street: '123 Test St',
                ward: 'Test Ward',
                district: 'Test District',
                city: 'Test City'
            },
            items: [{
                productId: product._id,
                productName: product.name,
                priceAtPurchase: 500000,
                quantity: 1,
                shopId: product.shopId
            }],
            paymentInfo: {
                method: 'VNPAY',
                status: 'PAID',
                transactionId: `TEST${Date.now()}`,
                paidAt: tenDaysAgo
            },
            subtotal: 500000,
            shippingFee: 0,
            tipAmount: 0,
            finalAmount: 500000,
            status: 'SHIPPED', // Start with SHIPPED
            createdAt: tenDaysAgo,
            updatedAt: tenDaysAgo
        });

        await testOrder.save();
        console.log(`✅ Created test order: ${testOrder._id}`);
        console.log(`📅 Order age: 10 days\n`);

        console.log('🔄 Changing status to DELIVERED...\n');
        console.log('='.repeat(80));

        // This should trigger auto-payment
        await testOrder.updateStatus('DELIVERED');

        console.log('='.repeat(80));

        // Check seller balance after
        const sellerAfter = await User.findById(seller._id);
        const balanceAfter = sellerAfter.balance || 0;
        const balanceBefore = seller.balance || 0;
        const difference = balanceAfter - balanceBefore;

        console.log(`\n💰 Seller Balance:`);
        console.log(`   Before: ${balanceBefore.toLocaleString()} VND`);
        console.log(`   After:  ${balanceAfter.toLocaleString()} VND`);
        console.log(`   Diff:   +${difference.toLocaleString()} VND\n`);

        if (difference > 0) {
            console.log('✅ SUCCESS: Seller was paid automatically!\n');
        } else {
            console.log('❌ FAILED: Seller was not paid!\n');
        }

        // Clean up
        console.log('🗑️  Cleaning up test order...');
        await Order.findByIdAndDelete(testOrder._id);
        
        // Also delete the transaction
        const SellerTransaction = require('../models/SellerTransaction');
        await SellerTransaction.deleteMany({ orderId: testOrder._id });
        
        // Restore seller balance
        seller.balance = balanceBefore;
        await seller.save();
        
        console.log('✅ Cleanup completed\n');

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

