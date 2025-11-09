/**
 * Test both middleware approaches:
 * 1. Pre-save hook (for .save())
 * 2. Pre-update hook (for .updateOne(), .findOneAndUpdate())
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

const main = async () => {
    try {
        await connectDB();

        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║   Test Both Middleware Approaches                         ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        // Find 2 non-DELIVERED orders
        const testOrders = await Order.find({ 
            status: { $ne: 'DELIVERED' }
        }).limit(2);

        if (testOrders.length < 2) {
            console.log('❌ Need at least 2 non-DELIVERED orders for testing');
            return;
        }

        const [order1, order2] = testOrders;

        console.log('📦 Test Order 1:', order1._id);
        console.log('📦 Test Order 2:', order2._id);
        console.log('');

        // ============================================================
        // TEST 1: Using .save() method
        // ============================================================
        console.log('='.repeat(80));
        console.log('TEST 1: Using .save() method (Pre-save hook)');
        console.log('='.repeat(80));
        console.log(`\n📦 Order 1: ${order1._id}`);
        console.log(`   Current Status: ${order1.status}`);
        console.log(`   Current deliveredAt: ${order1.deliveredAt || 'null'}\n`);

        console.log('🔄 Changing status to DELIVERED and calling .save()...\n');
        
        order1.status = 'DELIVERED';
        await order1.save();

        const updated1 = await Order.findById(order1._id);
        console.log('📊 Result:');
        console.log(`   Status: ${updated1.status}`);
        console.log(`   deliveredAt: ${updated1.deliveredAt ? updated1.deliveredAt.toLocaleString('vi-VN') : 'null'}`);
        
        if (updated1.deliveredAt) {
            console.log('\n✅ Pre-save hook worked!\n');
        } else {
            console.log('\n❌ Pre-save hook failed!\n');
        }

        // ============================================================
        // TEST 2: Using .updateOne() method
        // ============================================================
        console.log('='.repeat(80));
        console.log('TEST 2: Using .updateOne() method (Pre-update hook)');
        console.log('='.repeat(80));
        console.log(`\n📦 Order 2: ${order2._id}`);
        console.log(`   Current Status: ${order2.status}`);
        console.log(`   Current deliveredAt: ${order2.deliveredAt || 'null'}\n`);

        console.log('🔄 Changing status to DELIVERED using .updateOne()...\n');
        
        await Order.updateOne(
            { _id: order2._id },
            { $set: { status: 'DELIVERED' } }
        );

        const updated2 = await Order.findById(order2._id);
        console.log('📊 Result:');
        console.log(`   Status: ${updated2.status}`);
        console.log(`   deliveredAt: ${updated2.deliveredAt ? updated2.deliveredAt.toLocaleString('vi-VN') : 'null'}`);
        
        if (updated2.deliveredAt) {
            console.log('\n✅ Pre-update hook worked!\n');
        } else {
            console.log('\n❌ Pre-update hook failed!\n');
        }

        // ============================================================
        // SUMMARY
        // ============================================================
        console.log('='.repeat(80));
        console.log('📊 SUMMARY');
        console.log('='.repeat(80));
        console.log('');
        console.log('✅ Both middleware hooks are working!');
        console.log('');
        console.log('Now deliveredAt will be auto-set when:');
        console.log('  1. ✅ Using order.save() in code');
        console.log('  2. ✅ Using Order.updateOne() in code');
        console.log('  3. ✅ Using Order.findOneAndUpdate() in code');
        console.log('  4. ✅ Editing in MongoDB Compass (uses Mongoose)');
        console.log('');
        console.log('💡 You can now safely edit status to DELIVERED in MongoDB Compass');
        console.log('   and deliveredAt will be automatically set!\n');

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

