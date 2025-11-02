const mongoose = require('mongoose');
const Order = require('../models/Order');
const Shipment = require('../models/Shipment');

const MONGODB_URI = 'mongodb://localhost:27017/WDP';

async function syncDeliveredOrderStatus() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all DELIVERED shipments
    const deliveredShipments = await Shipment.find({
      status: 'DELIVERED'
    }).populate('orderId');

    console.log(`\n📦 Found ${deliveredShipments.length} DELIVERED shipments`);

    let updated = 0;
    let skipped = 0;

    for (const shipment of deliveredShipments) {
      if (!shipment.orderId) {
        console.log(`⚠️  Shipment ${shipment._id} - No order found`);
        skipped++;
        continue;
      }

      const order = await Order.findById(shipment.orderId);
      
      if (!order) {
        console.log(`⚠️  Order ${shipment.orderId} - Not found`);
        skipped++;
        continue;
      }

      if (order.status === 'DELIVERED') {
        console.log(`⏭️  Order ${order.orderNumber} - Already DELIVERED`);
        skipped++;
        continue;
      }

      // Update order status to DELIVERED
      console.log(`🔄 Updating order ${order.orderNumber} from ${order.status} to DELIVERED`);
      await order.updateStatus('DELIVERED', 'Đơn hàng đã được giao thành công bởi shipper (sync)');
      await order.save();
      
      console.log(`✅ Updated order ${order.orderNumber} to DELIVERED`);
      updated++;
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Updated: ${updated} orders`);
    console.log(`   ⏭️  Skipped: ${skipped} (already delivered or not found)`);
    console.log(`   📦 Total: ${deliveredShipments.length} shipments processed`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

syncDeliveredOrderStatus();
