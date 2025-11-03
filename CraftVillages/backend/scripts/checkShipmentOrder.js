const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/WDP');

async function checkShipmentOrder() {
  try {
    await new Promise((resolve) => {
      if (mongoose.connection.readyState === 1) {
        resolve();
      } else {
        mongoose.connection.once('open', resolve);
      }
    });
    
    console.log('\n✅ Connected to WDP database\n');

    const db = mongoose.connection.db;
    const shipmentsCollection = db.collection('shipments');
    const ordersCollection = db.collection('orders');
    
    // Find the shipment that's showing in dashboard
    const shipment = await shipmentsCollection.findOne({ 
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439024')
    });
    
    if (!shipment) {
      console.log('❌ Shipment not found');
      return;
    }
    
    console.log('📦 Shipment Details:');
    console.log(`   ID: ${shipment._id}`);
    console.log(`   Status: ${shipment.status}`);
    console.log(`   Order ID: ${shipment.orderId}`);
    console.log(`   Tracking: ${shipment.trackingNumber}`);
    console.log(`   Shipper Code: ${shipment.shipperCode}`);
    console.log(`   Has statusEvents: ${shipment.statusEvents ? 'YES' : 'NO'}`);
    console.log(`   Has pickupLocation: ${shipment.pickupLocation ? 'YES' : 'NO'}`);
    console.log('');
    
    // Check if order exists
    if (shipment.orderId) {
      const order = await ordersCollection.findOne({ 
        _id: shipment.orderId 
      });
      
      if (order) {
        console.log('✅ Order EXISTS in database');
        console.log(`   Order ID: ${order._id}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Final Amount: ${order.finalAmount?.toLocaleString('vi-VN')} VND`);
        console.log(`   Customer: ${order.buyerInfo?.fullName || 'N/A'}`);
        console.log(`   Items: ${order.items?.length || 0}`);
        console.log('');
      } else {
        console.log('❌ Order DOES NOT EXIST in database');
        console.log('   This is why everything shows N/A!');
        console.log('');
        console.log('💡 Solution: Need to either:');
        console.log('   1. Create matching orders for these shipments');
        console.log('   2. Use real orders from your database');
        console.log('   3. Update shipment.orderId to point to existing order');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

checkShipmentOrder();
