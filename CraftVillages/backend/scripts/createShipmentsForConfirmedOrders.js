const mongoose = require('mongoose');
const Order = require('../models/Order');
const Shipment = require('../models/Shipment');

const MONGODB_URI = 'mongodb://localhost:27017/WDP';

async function createShipmentsForConfirmedOrders() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all CONFIRMED or SHIPPED orders
    const orders = await Order.find({
      status: { $in: ['CONFIRMED', 'SHIPPED'] }
    });

    console.log(`\n📦 Found ${orders.length} CONFIRMED/SHIPPED orders`);

    let created = 0;
    let skipped = 0;

    for (const order of orders) {
      // Check if shipment already exists
      const existingShipment = await Shipment.findOne({ orderId: order._id });

      if (existingShipment) {
        console.log(`⏭️  Order ${order.orderNumber} - Shipment already exists`);
        skipped++;
        continue;
      }

      // Calculate shipping fee for shipper
      const estimatedDistance = 10; // km
      const baseFee = 15000; // 15k base
      const distanceFee = estimatedDistance * 3000; // 3k per km
      const totalFee = baseFee + distanceFee;

      // Create new shipment
      const newShipment = new Shipment({
        orderId: order._id,
        status: 'READY_FOR_PICKUP',
        pickupLocation: {
          address: 'Địa chỉ shop',
          coordinates: {
            lat: 0,
            lng: 0
          }
        },
        deliveryLocation: {
          address: order.shippingAddress?.fullAddress || 'N/A',
          coordinates: {
            lat: 0,
            lng: 0
          }
        },
        distance: estimatedDistance,
        estimatedDistance: estimatedDistance,
        estimatedDuration: 30,
        shippingFee: {
          baseFee: baseFee,
          distanceFee: distanceFee,
          weightFee: 0,
          bonus: 0,
          total: totalFee
        },
        trackingHistory: [{
          status: 'READY_FOR_PICKUP',
          notes: 'Đơn hàng sẵn sàng để shipper lấy hàng',
          timestamp: new Date()
        }]
      });

      await newShipment.save();
      console.log(`✅ Created shipment for order ${order.orderNumber} (${order._id})`);
      created++;
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Created: ${created} shipments`);
    console.log(`   ⏭️  Skipped: ${skipped} (already have shipments)`);
    console.log(`   📦 Total: ${orders.length} orders processed`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

createShipmentsForConfirmedOrders();
