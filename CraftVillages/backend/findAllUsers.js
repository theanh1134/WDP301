const mongoose = require('mongoose');
const User = require('./models/User');
const Order = require('./models/Order');

mongoose.connect('mongodb://localhost:27017/craft_villages')
    .then(async () => {
        console.log('Connected to MongoDB');
        
        // Find all users with name containing "Đoàn Thế Anh"
        const users = await User.find({ 
            fullName: /Đoàn Thế Anh/i 
        }).select('_id fullName email phoneNumber');
        
        console.log('\n👥 Found', users.length, 'users with name "Đoàn Thế Anh":');
        
        for (const user of users) {
            console.log('\n-----------------------------------');
            console.log('👤 User:');
            console.log('   ID:', user._id);
            console.log('   Name:', user.fullName);
            console.log('   Email:', user.email);
            console.log('   Phone:', user.phoneNumber);
            
            // Count orders for this user
            const totalOrders = await Order.countDocuments({ 
                'buyerInfo.userId': user._id 
            });
            
            const validOrders = await Order.countDocuments({ 
                'buyerInfo.userId': user._id,
                status: { $nin: ['CANCELLED', 'REFUNDED'] }
            });
            
            const cancelledOrders = await Order.countDocuments({ 
                'buyerInfo.userId': user._id,
                status: { $in: ['CANCELLED', 'REFUNDED'] }
            });
            
            console.log('   📊 Total orders:', totalOrders);
            console.log('   ✅ Valid orders:', validOrders);
            console.log('   ❌ Cancelled/Refunded:', cancelledOrders);
        }
        
        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });

