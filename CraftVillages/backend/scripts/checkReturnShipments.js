const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Shop = require('../models/Shop');
const Return = require('../models/Return');
const Shipment = require('../models/Shipment');

async function checkReturnShipments() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Lấy tất cả returns đã APPROVED
        const approvedReturns = await Return.find({ status: 'APPROVED' })
            .populate('buyerId', 'fullName')
            .populate('shopId', 'shopName');
        
        console.log(`\n📦 Found ${approvedReturns.length} approved returns:`);
        approvedReturns.forEach(ret => {
            console.log(`  - RMA: ${ret.rmaCode}, Method: ${ret.returnMethod}, Status: ${ret.status}`);
        });

        // Lấy tất cả shipments loại RETURN_PICKUP
        const returnShipments = await Shipment.find({ shipmentType: 'RETURN_PICKUP' })
            .populate('returnId');
        
        console.log(`\n🚚 Found ${returnShipments.length} return pickup shipments:`);
        returnShipments.forEach(ship => {
            console.log(`  - Shipment ID: ${ship._id}`);
            console.log(`    Return: ${ship.returnId?.rmaCode || 'N/A'}`);
            console.log(`    Status: ${ship.status}`);
            console.log(`    Has Shipper: ${ship.shipperId ? 'Yes' : 'No'}`);
        });

        // Kiểm tra returns APPROVED không có shipment
        console.log('\n⚠️  Checking for approved returns without shipments...');
        for (const ret of approvedReturns) {
            const hasShipment = await Shipment.findOne({ returnId: ret._id });
            if (!hasShipment && ret.returnMethod === 'PICKUP') {
                console.log(`  ❌ Return ${ret.rmaCode} needs a shipment!`);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
}

checkReturnShipments();
