const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/WDP', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkShipments() {
  try {
    // Wait for connection
    await new Promise((resolve) => {
      if (mongoose.connection.readyState === 1) {
        resolve();
      } else {
        mongoose.connection.once('open', resolve);
      }
    });
    
    console.log('\n✅ Connected to WDP database\n');

    // Get shipments collection directly
    const db = mongoose.connection.db;
    const shipmentsCollection = db.collection('shipments');
    
    const allShipments = await shipmentsCollection.find({}).toArray();
    
    console.log(`📦 Total shipments in collection: ${allShipments.length}\n`);
    
    // Group by status
    const byStatus = {};
    const withoutShipper = [];
    
    for (const shipment of allShipments) {
      // Count by status
      byStatus[shipment.status] = (byStatus[shipment.status] || 0) + 1;
      
      // Track shipments without shipper
      if (!shipment.shipperId) {
        withoutShipper.push(shipment);
      }
    }
    
    console.log('📊 Shipments by status:');
    for (const [status, count] of Object.entries(byStatus)) {
      console.log(`   ${status}: ${count}`);
    }
    
    console.log(`\n🚚 Shipments without shipper: ${withoutShipper.length}`);
    
    if (withoutShipper.length > 0) {
      console.log('\n📋 Details of shipments without shipper:\n');
      for (const shipment of withoutShipper) {
        console.log('==========================================');
        console.log(`Shipment ID: ${shipment._id}`);
        console.log(`Order ID: ${shipment.orderId}`);
        console.log(`Status: ${shipment.status}`);
        console.log(`Tracking Number: ${shipment.trackingNumber || 'N/A'}`);
        console.log(`Shipper Code: ${shipment.shipperCode || 'N/A'}`);
        console.log(`Created: ${shipment.createdAt}`);
        
        // Check if this is new schema or old schema
        if (shipment.pickupLocation) {
          console.log('Schema Type: OLD (has pickupLocation)');
        } else if (shipment.statusEvents) {
          console.log('Schema Type: NEW (has statusEvents)');
        }
        console.log('');
      }
    }
    
    // Check for CREATED status shipments (available for pickup in new schema)
    const createdShipments = await shipmentsCollection.find({ 
      status: 'CREATED',
      shipperId: null 
    }).toArray();
    
    console.log('\n==========================================');
    console.log(`✨ Shipments with status CREATED and no shipper: ${createdShipments.length}`);
    
    if (createdShipments.length > 0) {
      console.log('\nThese should appear in "Available Orders":\n');
      for (const shipment of createdShipments) {
        console.log(`  📦 Tracking: ${shipment.trackingNumber}`);
        console.log(`     Order ID: ${shipment.orderId}`);
        console.log(`     Shipper Code: ${shipment.shipperCode}`);
        console.log('');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  }
}

checkShipments();
