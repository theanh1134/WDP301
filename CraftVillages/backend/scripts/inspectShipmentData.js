const mongoose = require('mongoose');

// Import all required models
require('../models/User');
require('../models/Shop');
require('../models/Product');
require('../models/Shipper');
const Shipment = require('../models/Shipment');
const Order = require('../models/Order');

mongoose.connect('mongodb://localhost:27017/WDP', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function inspectShipments() {
  try {
    console.log('\n✅ Connected to WDP database\n');

    // Get all shipments with populated order data
    const shipments = await Shipment.find({})
      .populate('orderId')
      .populate('shipperId')
      .lean();

    console.log(`📦 Found ${shipments.length} shipments\n`);

    for (const shipment of shipments) {
      console.log('==========================================');
      console.log(`Shipment ID: ${shipment._id}`);
      console.log(`Status: ${shipment.status}`);
      console.log(`ShipperId: ${shipment.shipperId || 'NULL (Available for pickup)'}`);
      console.log(`\nOrder Data:`);
      
      if (shipment.orderId) {
        console.log(`  - Order ID: ${shipment.orderId._id}`);
        console.log(`  - Order Number: ${shipment.orderId.orderNumber || 'N/A'}`);
        console.log(`  - Order Status: ${shipment.orderId.status}`);
        console.log(`  - Total: ${shipment.orderId.totalAmount}`);
        console.log(`  - Customer: ${shipment.orderId.userId}`);
      } else {
        console.log(`  ❌ Order not found or invalid orderId reference`);
      }
      
      console.log(`\nLocation Data:`);
      console.log(`  - Pickup: ${shipment.pickupLocation?.address || 'N/A'}`);
      console.log(`  - Delivery: ${shipment.deliveryLocation?.address || 'N/A'}`);
      console.log('');
    }

    // Check for orders with CONFIRMED status (ready to be shipped)
    console.log('\n==========================================');
    console.log('📋 Checking orders ready for shipment...\n');
    
    const confirmedOrders = await Order.find({ status: 'CONFIRMED' })
      .lean();
    
    console.log(`Found ${confirmedOrders.length} CONFIRMED orders:\n`);
    for (const order of confirmedOrders) {
      const orderDisplayNumber = `#${order._id.toString().slice(-8).toUpperCase()}`;
      console.log(`  📦 Order: ${orderDisplayNumber}`);
      console.log(`     Full ID: ${order._id}`);
      console.log(`     Status: ${order.status}`);
      console.log(`     Final Amount: ${order.finalAmount?.toLocaleString('vi-VN')} VND`);
      console.log(`     Customer: ${order.buyerInfo?.fullName || 'N/A'}`);
      console.log(`     Items: ${order.items?.length || 0} products`);
      console.log(`     Delivery Address: ${order.shippingAddress?.fullAddress || 'N/A'}`);
      
      // Check if shipment exists
      const hasShipment = await Shipment.findOne({ orderId: order._id });
      console.log(`     Shipment exists: ${hasShipment ? '✅ YES' : '❌ NO - Seller needs to change status to SHIPPING'}`);
      console.log('');
    }
    
    // Check shipments without shippers
    console.log('\n==========================================');
    console.log('🚚 Checking available orders for shippers...\n');
    
    const availableShipments = await Shipment.find({
      $or: [{ shipperId: null }, { shipperId: { $exists: false } }],
      status: 'READY_FOR_PICKUP'
    })
      .populate('orderId')
      .lean();
    
    console.log(`Found ${availableShipments.length} shipments ready for pickup:\n`);
    for (const shipment of availableShipments) {
      if (shipment.orderId) {
        const orderDisplayNumber = `#${shipment.orderId._id.toString().slice(-8).toUpperCase()}`;
        console.log(`  📦 ${orderDisplayNumber}`);
        console.log(`     Pickup: ${shipment.pickupLocation?.address || 'N/A'}`);
        console.log(`     Delivery: ${shipment.deliveryLocation?.address || 'N/A'}`);
        console.log('');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

inspectShipments();
