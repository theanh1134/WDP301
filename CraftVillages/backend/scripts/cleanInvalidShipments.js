const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/WDP')
.then(async () => {
    console.log('✅ Connected to WDP database\n');
    
    const db = mongoose.connection.db;
    const shipmentsCollection = db.collection('shipments');
    const ordersCollection = db.collection('orders');
    
    // Get all shipments
    const allShipments = await shipmentsCollection.find({}).toArray();
    console.log(`📦 Total shipments: ${allShipments.length}\n`);
    
    // Check which shipments have invalid orderId
    const invalidShipments = [];
    for (const shipment of allShipments) {
        if (!shipment.orderId) {
            invalidShipments.push(shipment._id);
            console.log(`❌ Shipment ${shipment._id}: No orderId`);
            continue;
        }
        
        const order = await ordersCollection.findOne({ _id: shipment.orderId });
        if (!order) {
            invalidShipments.push(shipment._id);
            console.log(`❌ Shipment ${shipment._id}: Order ${shipment.orderId} not found`);
        } else {
            console.log(`✅ Shipment ${shipment._id}: Valid (Order: ${order.orderNumber || order._id})`);
        }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   Valid shipments: ${allShipments.length - invalidShipments.length}`);
    console.log(`   Invalid shipments: ${invalidShipments.length}`);
    
    if (invalidShipments.length > 0) {
        console.log(`\n🗑️  Deleting ${invalidShipments.length} invalid shipments...`);
        const deleteResult = await shipmentsCollection.deleteMany({
            _id: { $in: invalidShipments }
        });
        console.log(`✅ Deleted ${deleteResult.deletedCount} shipments`);
    }
    
    console.log('\n✨ Done! Now go to Seller Dashboard and change order status to "Đang giao"');
    
    await mongoose.connection.close();
    process.exit(0);
})
.catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
});
