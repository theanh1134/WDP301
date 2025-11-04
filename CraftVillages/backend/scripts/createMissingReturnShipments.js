const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Shop = require('../models/Shop');
const Return = require('../models/Return');
const Shipment = require('../models/Shipment');

async function createMissingShipments() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Tìm các return APPROVED có method PICKUP nhưng chưa có shipment
        const approvedReturns = await Return.find({ 
            status: 'APPROVED',
            returnMethod: 'PICKUP'
        }).populate('buyerId').populate('shopId');

        console.log(`Found ${approvedReturns.length} approved PICKUP returns\n`);

        let created = 0;
        for (const returnOrder of approvedReturns) {
            // Kiểm tra xem đã có shipment chưa
            const existingShipment = await Shipment.findOne({ returnId: returnOrder._id });
            
            if (existingShipment) {
                console.log(`✓ Return ${returnOrder.rmaCode} already has shipment`);
                continue;
            }

            console.log(`📦 Creating shipment for ${returnOrder.rmaCode}...`);
            
            const newShipment = new Shipment({
                returnId: returnOrder._id,
                shipmentType: 'RETURN_PICKUP',
                status: 'READY_FOR_PICKUP',
                pickupLocation: {
                    address: returnOrder.pickupAddress?.fullAddress || returnOrder.buyerId?.address || 'N/A',
                    timestamp: new Date()
                },
                deliveryLocation: {
                    address: returnOrder.shopId?.address || 'N/A',
                    timestamp: null
                },
                shippingFee: {
                    baseFee: returnOrder.shippingFee || 0,
                    distanceFee: 0,
                    weightFee: 0,
                    bonus: 0,
                    total: returnOrder.shippingFee || 0
                },
                trackingHistory: [{
                    status: 'READY_FOR_PICKUP',
                    timestamp: new Date(),
                    notes: 'Tạo shipment cho đơn hoàn hàng đã duyệt'
                }]
            });

            await newShipment.save();
            console.log(`  ✅ Created shipment ${newShipment._id}`);
            created++;
        }

        console.log(`\n✅ Created ${created} shipments`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
}

createMissingShipments();
