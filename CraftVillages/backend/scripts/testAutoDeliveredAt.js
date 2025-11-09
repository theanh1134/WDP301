/**
 * Test auto-set deliveredAt when status changes to DELIVERED
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
        console.log('║   Test Auto-Set deliveredAt Middleware                    ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        // Find a SHIPPED order (or any non-DELIVERED order)
        let testOrder = await Order.findOne({ status: 'SHIPPED' });

        if (!testOrder) {
            console.log('⚠️  No SHIPPED order found. Looking for any non-DELIVERED order...');
            testOrder = await Order.findOne({ 
                status: { $ne: 'DELIVERED' }
            });
        }

        if (!testOrder) {
            console.log('❌ No suitable order found for testing');
            console.log('   All orders are already DELIVERED');
            return;
        }

        console.log(`📦 Found test order: ${testOrder._id}`);
        console.log(`   Current Status: ${testOrder.status}`);
        console.log(`   Current deliveredAt: ${testOrder.deliveredAt || 'null'}\n`);

        console.log('='.repeat(80));
        console.log('🔄 Changing status to DELIVERED directly (simulating MongoDB update)...\n');
        console.log('Expected: deliveredAt should be auto-set by middleware');
        console.log('='.repeat(80));

        // Change status directly and save (simulating MongoDB Compass edit)
        testOrder.status = 'DELIVERED';
        await testOrder.save();

        console.log('\n📊 After save:\n');

        // Reload order to verify
        const updatedOrder = await Order.findById(testOrder._id);

        console.log(`   Status: ${updatedOrder.status}`);
        console.log(`   deliveredAt: ${updatedOrder.deliveredAt ? updatedOrder.deliveredAt.toLocaleString('vi-VN') : 'null'}`);

        console.log('\n='.repeat(80));

        if (updatedOrder.deliveredAt) {
            console.log('✅ TEST PASSED: deliveredAt was auto-set by middleware!\n');
            console.log('💡 Now when you edit status to DELIVERED in MongoDB Compass,');
            console.log('   deliveredAt will be automatically set!\n');
        } else {
            console.log('❌ TEST FAILED: deliveredAt was not set\n');
        }

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

