/**
 * Fix Missing paidAt Field
 * Updates all orders with paymentInfo.status = PAID but missing paidAt
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

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

const fixMissingPaidAt = async () => {
    try {
        console.log('🔧 Fixing Missing paidAt Field\n');
        console.log('='.repeat(80));

        // Find all orders with PAID status but missing paidAt
        const orders = await Order.find({
            'paymentInfo.status': 'PAID',
            $or: [
                { 'paymentInfo.paidAt': null },
                { 'paymentInfo.paidAt': { $exists: false } }
            ]
        });

        console.log(`\n📦 Found ${orders.length} orders with missing paidAt\n`);

        if (orders.length === 0) {
            console.log('✅ No orders need fixing!\n');
            return;
        }

        let fixedCount = 0;

        for (const order of orders) {
            console.log(`[${fixedCount + 1}/${orders.length}] Order: ${order._id}`);
            console.log(`   Status: ${order.status}`);
            console.log(`   Payment Status: ${order.paymentInfo.status}`);
            console.log(`   Created: ${order.createdAt.toLocaleString('vi-VN')}`);

            // Fix invalid status 'PAID' -> should be 'DELIVERED'
            const validStatuses = ['PENDING', 'PROCESSING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
            if (!validStatuses.includes(order.status)) {
                console.log(`   ⚠️  Invalid status '${order.status}', changing to 'DELIVERED'`);
                order.status = 'DELIVERED';
            }

            // Set paidAt to buyerConfirmedAt if available, otherwise use updatedAt
            let paidAt;
            if (order.buyerConfirmedAt) {
                paidAt = order.buyerConfirmedAt;
                console.log(`   Using buyerConfirmedAt: ${paidAt.toLocaleString('vi-VN')}`);
            } else if (order.status === 'DELIVERED' && order.updatedAt) {
                paidAt = order.updatedAt;
                console.log(`   Using updatedAt: ${paidAt.toLocaleString('vi-VN')}`);
            } else {
                paidAt = new Date();
                console.log(`   Using current time: ${paidAt.toLocaleString('vi-VN')}`);
            }

            // Update paidAt
            order.paymentInfo.paidAt = paidAt;
            await order.save();

            console.log(`   ✅ Fixed! paidAt set to: ${paidAt.toLocaleString('vi-VN')}\n`);
            fixedCount++;
        }

        console.log('='.repeat(80));
        console.log(`\n✅ Fixed ${fixedCount} orders!\n`);

    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    }
};

const main = async () => {
    try {
        await connectDB();
        await fixMissingPaidAt();
    } catch (error) {
        console.error('Fatal error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Database connection closed');
        process.exit(0);
    }
};

main();

