/**
 * Create a 10-day-old order for testing auto payment
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

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
        console.log('║   Create 10-Day-Old Order for Testing                    ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        // Find a valid product
        const product = await Product.findOne();
        if (!product) {
            console.log('❌ No product found');
            return;
        }

        // Find seller
        const seller = await User.findById(product.shopId);
        if (!seller) {
            console.log('❌ Seller not found');
            return;
        }

        console.log(`📦 Product: ${product.name}`);
        console.log(`👤 Seller: ${seller.fullName}`);
        console.log(`💰 Seller Balance: ${(seller.balance || 0).toLocaleString()} VND\n`);

        // Find a buyer (any user that is not the seller)
        const buyer = await User.findOne({ _id: { $ne: seller._id }, role: 'BUYER' });
        if (!buyer) {
            console.log('❌ No buyer found');
            return;
        }

        // Create order 10 days ago
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

        const testOrder = new Order({
            buyerInfo: {
                userId: buyer._id,
                fullName: buyer.fullName,
                email: buyer.email,
                phone: buyer.phone || '0123456789'
            },
            shippingAddress: {
                street: '123 Test Street',
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
                transactionId: `TESTAUTO${Date.now()}`,
                paidAt: tenDaysAgo
            },
            subtotal: 500000,
            shippingFee: 0,
            tipAmount: 0,
            finalAmount: 500000,
            status: 'SHIPPED',
            createdAt: tenDaysAgo,
            updatedAt: tenDaysAgo
        });

        await testOrder.save();

        console.log(`✅ Created test order: ${testOrder._id}`);
        console.log(`📅 Created: ${testOrder.createdAt.toLocaleString('vi-VN')}`);
        console.log(`📊 Status: ${testOrder.status}`);
        console.log(`💰 Amount: ${testOrder.finalAmount.toLocaleString()} VND\n`);

        console.log('🔄 Now changing status to DELIVERED...\n');
        console.log('='.repeat(80));

        await testOrder.updateStatus('DELIVERED');

        console.log('='.repeat(80));

        // Check result
        const updatedOrder = await Order.findById(testOrder._id);
        const sellerAfter = await User.findById(seller._id);

        console.log(`\n💳 Seller Payment Status: ${updatedOrder.sellerPayment?.isPaid ? 'PAID ✅' : 'UNPAID ❌'}`);
        
        if (updatedOrder.sellerPayment?.isPaid) {
            console.log(`💰 Amount Paid: ${updatedOrder.sellerPayment.netAmount.toLocaleString()} VND`);
            console.log(`📝 Transaction: ${updatedOrder.sellerPayment.transactionId}`);
            console.log(`💰 Seller Balance: ${(seller.balance || 0).toLocaleString()} → ${(sellerAfter.balance || 0).toLocaleString()} VND\n`);
            console.log('✅ SUCCESS: Auto payment worked!\n');
        } else {
            console.log('\n❌ FAILED: Seller was not paid\n');
        }

        console.log(`📝 Test Order ID: ${testOrder._id}`);
        console.log(`   Use this to clean up later if needed\n`);

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

