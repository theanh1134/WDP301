const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/WDP')
.then(async () => {
    console.log('✅ Connected to WDP database\n');
    
    const db = mongoose.connection.db;
    
    // Check shippers
    const shippers = await db.collection('shippers').find({}).toArray();
    console.log(`📊 Total shippers: ${shippers.length}`);
    shippers.forEach(s => {
        console.log(`   - ID: ${s._id}`);
        console.log(`     User ID: ${s.userId}`);
        console.log(`     License: ${s.licenseNumber}`);
        console.log(`     Vehicle: ${s.vehicleType} ${s.vehicleNumber}`);
        console.log('');
    });
    
    // Check earnings
    const earnings = await db.collection('shipperearnings').find({}).toArray();
    console.log(`💰 Total earnings records: ${earnings.length}`);
    if (earnings.length > 0) {
        console.log('\nFirst 3 earnings:');
        earnings.slice(0, 3).forEach(e => {
            console.log(`   - Shipper ID: ${e.shipperId}`);
            console.log(`     Date: ${e.date || e.createdAt}`);
            console.log(`     Total: ${e.earnings?.total || e.totalEarning}`);
            console.log('');
        });
    }
    
    await mongoose.connection.close();
    process.exit(0);
})
.catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
});
