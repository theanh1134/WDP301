const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/WDP');

async function makeShipmentAvailable() {
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
    
    // Find the CREATED shipment
    const createdShipment = await shipmentsCollection.findOne({ status: 'CREATED' });
    
    if (!createdShipment) {
      console.log('❌ No shipment with status CREATED found');
      return;
    }
    
    console.log('📦 Found CREATED shipment:');
    console.log(`   ID: ${createdShipment._id}`);
    console.log(`   Order ID: ${createdShipment.orderId}`);
    console.log(`   Tracking: ${createdShipment.trackingNumber}`);
    console.log(`   Current Shipper ID: ${createdShipment.shipperId}`);
    console.log('');
    
    // Update to remove shipperId (make it available)
    const result = await shipmentsCollection.updateOne(
      { _id: createdShipment._id },
      { 
        $unset: { shipperId: "" }
      }
    );
    
    console.log('✅ Updated shipment to make it available!');
    console.log(`   Modified count: ${result.modifiedCount}`);
    console.log('');
    console.log('🚀 Now this shipment should appear in Shipper Dashboard "Đơn hàng có sẵn"');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

makeShipmentAvailable();
