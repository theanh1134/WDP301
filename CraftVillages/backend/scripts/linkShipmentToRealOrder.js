const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/WDP');

async function linkShipmentToRealOrder() {
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
    
    // Find the real CONFIRMED order (from earlier inspection)
    const realOrder = await ordersCollection.findOne({ 
      _id: new mongoose.Types.ObjectId('6907571b74ef1a5c9f71c56c') // Order #9F71C56C
    });
    
    if (!realOrder) {
      console.log('❌ Real order not found. Let me find any CONFIRMED order...\n');
      
      const anyConfirmedOrder = await ordersCollection.findOne({ 
        status: 'CONFIRMED' 
      });
      
      if (anyConfirmedOrder) {
        console.log('✅ Found a CONFIRMED order:');
        console.log(`   ID: ${anyConfirmedOrder._id}`);
        console.log(`   Display: #${anyConfirmedOrder._id.toString().slice(-8).toUpperCase()}`);
        console.log(`   Amount: ${anyConfirmedOrder.finalAmount?.toLocaleString('vi-VN')} VND`);
        console.log('');
        
        // Update shipment to point to this order
        const result = await shipmentsCollection.updateOne(
          { _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439024') },
          { 
            $set: { 
              orderId: anyConfirmedOrder._id,
              status: 'READY_FOR_PICKUP' // Also update to better status name
            }
          }
        );
        
        console.log('✅ Updated shipment!');
        console.log(`   Modified: ${result.modifiedCount}`);
        console.log('\n🚀 Now reload Shipper Dashboard to see proper data!');
      } else {
        console.log('❌ No CONFIRMED orders found in database');
        console.log('\n💡 You need to:');
        console.log('   1. Go to Seller Dashboard');
        console.log('   2. Find an order and change status to CONFIRMED');
        console.log('   3. Then run this script again');
      }
    } else {
      console.log('✅ Found real order #9F71C56C:');
      console.log(`   ID: ${realOrder._id}`);
      console.log(`   Status: ${realOrder.status}`);
      console.log(`   Amount: ${realOrder.finalAmount?.toLocaleString('vi-VN')} VND`);
      console.log(`   Customer: ${realOrder.buyerInfo?.fullName}`);
      console.log('');
      
      // Update shipment
      const result = await shipmentsCollection.updateOne(
        { _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439024') },
        { 
          $set: { 
            orderId: realOrder._id,
            status: 'READY_FOR_PICKUP'
          }
        }
      );
      
      console.log('✅ Updated shipment to link with real order!');
      console.log(`   Modified: ${result.modifiedCount}`);
      console.log('\n🚀 Now reload Shipper Dashboard to see proper data!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

linkShipmentToRealOrder();
