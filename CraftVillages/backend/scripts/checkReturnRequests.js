const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Return = require('../models/Return');

async function checkReturnRequests() {
    try {
        const mongoUri = 'mongodb://127.0.0.1:27017/WDP';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        const Return = require('../models/Return');
        const Order = require('../models/Order');

        // Check specific order from screenshot
        const orderIdFromScreenshot = '690ec5098d426e6b9465448e';

        console.log('\n🔍 Checking Order ID:', orderIdFromScreenshot);

        // Find all return requests for this order
        const returns = await Return.find({ orderId: orderIdFromScreenshot })
            .select('rmaCode status items createdAt')
            .lean();

        console.log(`\n📦 Return Requests for Order ${orderIdFromScreenshot}:`);
        console.log(`Total returns: ${returns.length}\n`);

        if (returns.length > 0) {
            returns.forEach((ret, idx) => {
                console.log(`[${idx + 1}] RMA Code: ${ret.rmaCode}`);
                console.log(`    Status: ${ret.status}`);
                console.log(`    Created: ${ret.createdAt}`);
                console.log(`    Items:`, ret.items.map(i => ({
                    productId: i.productId,
                    productName: i.productName
                })));
                console.log('');
            });
        } else {
            console.log('✅ No return requests found for this order');
        }

        // Test the getReturnedProductIdsByOrderId function
        console.log('\n🧪 Testing getReturnedProductIdsByOrderId function:');
        const productIds = await getReturnedProductIdsByOrderId(orderIdFromScreenshot);
        console.log('Returned product IDs:', productIds);

async function getReturnedProductIdsByOrderId(orderId) {
    const returns = await Return.find({ orderId }).select('items.productId status').lean();
    if (!returns || returns.length === 0) return [];

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

    return Array.from(uniqueMap.values());
}

        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkReturnRequests();

