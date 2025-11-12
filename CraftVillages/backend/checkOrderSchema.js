const mongoose = require('mongoose');
const Order = require('./models/Order');

mongoose.connect('mongodb://localhost:27017/craft_villages')
    .then(async () => {
        console.log('Connected to MongoDB');
        
        // Get one order to check the schema
        const sampleOrder = await Order.findOne().select('buyerInfo');
        
        if (!sampleOrder) {
            console.log('❌ No orders found');
            process.exit(1);
        }
        
        console.log('\n📦 Sample order:');
        console.log('   Order ID:', sampleOrder._id);
        console.log('   buyerInfo:', JSON.stringify(sampleOrder.buyerInfo, null, 2));
        console.log('   userId type:', typeof sampleOrder.buyerInfo.userId);
        console.log('   userId value:', sampleOrder.buyerInfo.userId);
        
        // Try to find orders with string userId
        const userId = '68ecaa1adf7c860980d83f2d';
        
        const ordersWithString = await Order.countDocuments({ 
            'buyerInfo.userId': userId 
        });
        
        console.log('\n📊 Orders with string userId:', ordersWithString);
        
        // Try with ObjectId
        const ordersWithObjectId = await Order.countDocuments({ 
            'buyerInfo.userId': new mongoose.Types.ObjectId(userId) 
        });
        
        console.log('📊 Orders with ObjectId userId:', ordersWithObjectId);
        
        // Get all unique userIds
        const uniqueUserIds = await Order.distinct('buyerInfo.userId');
        console.log('\n👥 Total unique userIds:', uniqueUserIds.length);
        console.log('Sample userIds:', uniqueUserIds.slice(0, 5));
        
        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });

