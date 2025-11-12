const mongoose = require('mongoose');
const Order = require('./models/Order');

mongoose.connect('mongodb://127.0.0.1:27017/WDP')
    .then(async () => {
        console.log('Connected to MongoDB');

        // Use the userId from backend log
        const userId = new mongoose.Types.ObjectId('68ecaa1adf7c860980d83f2d');

        console.log('\n👤 Checking orders for userId:', userId.toString());

        // Find orders for this user
        const orders = await Order.find({
            'buyerInfo.userId': userId
        }).select('_id status createdAt finalAmount').sort({ createdAt: -1 });

        console.log('\n📊 Total orders found:', orders.length);
        console.log('\n📋 Order details:');

        const statusCount = {};
        orders.forEach((order, index) => {
            console.log(`${index + 1}. ${order._id} - Status: ${order.status} - Amount: ${order.finalAmount}₫ - Date: ${order.createdAt.toISOString().split('T')[0]}`);
            statusCount[order.status] = (statusCount[order.status] || 0) + 1;
        });

        console.log('\n📈 Status breakdown:');
        Object.entries(statusCount).forEach(([status, count]) => {
            console.log(`   ${status}: ${count}`);
        });

        // Count orders excluding CANCELLED and REFUNDED
        const validOrders = orders.filter(o => !['CANCELLED', 'REFUNDED'].includes(o.status));
        console.log('\n✅ Valid orders (excluding CANCELLED/REFUNDED):', validOrders.length);

        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });

