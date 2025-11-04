const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/WDP')
.then(async () => {
    console.log('✅ Connected to WDP database\n');
    
    const db = mongoose.connection.db;
    const shippersCollection = db.collection('shippers');
    const earningsCollection = db.collection('shipperearnings');
    
    // Find shipper with userId
    const shipper = await shippersCollection.findOne({
        userId: new mongoose.Types.ObjectId('68fc3422796a593588dbddab')
    });
    
    if (!shipper) {
        console.log('❌ Shipper not found!');
        await mongoose.connection.close();
        process.exit(1);
    }
    
    console.log(`✅ Found shipper:`);
    console.log(`   ID: ${shipper._id}`);
    console.log(`   User ID: ${shipper.userId}`);
    console.log(`   License: ${shipper.licenseNumber}`);
    console.log(`   Vehicle: ${shipper.vehicleType} ${shipper.vehicleNumber}\n`);
    
    // Delete ALL old earnings
    const deleteResult = await earningsCollection.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} old earnings records\n`);
    
    // Create new earnings for October 2025
    console.log('📅 Creating earnings for October 2025...\n');
    
    const newEarnings = [];
    const today = new Date('2025-10-29');
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        const baseFee = 15000 + Math.floor(Math.random() * 10000);
        const distanceFee = 5000 + Math.floor(Math.random() * 15000);
        const weightFee = 2000 + Math.floor(Math.random() * 5000);
        const bonus = Math.random() > 0.5 ? Math.floor(Math.random() * 10000) : 0;
        const total = baseFee + distanceFee + weightFee + bonus;
        
        newEarnings.push({
            shipperId: shipper._id,
            orderId: null,
            shipmentId: null,
            date: date,
            earnings: {
                baseFee: baseFee,
                distanceFee: distanceFee,
                weightFee: weightFee,
                bonus: bonus,
                deductions: 0,
                total: total
            },
            status: Math.random() > 0.3 ? 'COMPLETED' : 'PENDING',
            paymentMethod: 'BANK_TRANSFER',
            paymentDate: Math.random() > 0.3 ? date : null,
            notes: `Earning for ${date.toLocaleDateString('vi-VN')}`,
            createdAt: date,
            updatedAt: date
        });
    }
    
    await earningsCollection.insertMany(newEarnings);
    console.log(`✅ Created ${newEarnings.length} new earnings\n`);
    
    // Verify
    const allEarnings = await earningsCollection.find({
        shipperId: shipper._id
    }).toArray();
    
    console.log(`📊 Summary:`);
    console.log(`   Total records: ${allEarnings.length}`);
    console.log(`   Total earnings: ${allEarnings.reduce((sum, e) => sum + e.earnings.total, 0).toLocaleString()} VND`);
    console.log(`   Completed: ${allEarnings.filter(e => e.status === 'COMPLETED').length}`);
    console.log(`   Pending: ${allEarnings.filter(e => e.status === 'PENDING').length}\n`);
    
    // Update shipper
    await shippersCollection.updateOne(
        { _id: shipper._id },
        { $set: {
            totalEarnings: allEarnings.reduce((sum, e) => sum + e.earnings.total, 0),
            totalDeliveries: allEarnings.filter(e => e.status === 'COMPLETED').length
        }}
    );
    
    console.log('✅ Updated shipper totals');
    console.log('\n✨ Done! Reload dashboard to see data.');
    
    await mongoose.connection.close();
    process.exit(0);
})
.catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
});
