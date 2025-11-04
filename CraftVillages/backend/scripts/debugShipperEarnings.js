const mongoose = require('mongoose');
const Shipment = require('../models/Shipment');
const ShipperEarnings = require('../models/ShipperEarnings');
const Shipper = require('../models/Shipper');
const User = require('../models/User');

const MONGODB_URI = 'mongodb://localhost:27017/WDP';

async function debugShipperEarnings() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find shipper user
    const shipperUser = await User.findOne({ 
      email: 'phucnthe170081@gmail.com' 
    });
    
    if (!shipperUser) {
      console.log('❌ Shipper user not found');
      return;
    }

    console.log('👤 Shipper User:');
    console.log(`   ID: ${shipperUser._id}`);
    console.log(`   Email: ${shipperUser.email}`);
    console.log(`   Name: ${shipperUser.fullName}\n`);

    // Find shipper record
    const shipper = await Shipper.findOne({ userId: shipperUser._id });
    
    if (!shipper) {
      console.log('❌ Shipper record not found');
      return;
    }

    console.log('🚚 Shipper Record:');
    console.log(`   ID: ${shipper._id}`);
    console.log(`   Vehicle: ${shipper.vehicleType} - ${shipper.vehicleNumber}\n`);

    // Find shipments
    const shipments = await Shipment.find({ 
      shipperId: shipper._id 
    });

    console.log(`📦 Shipments (${shipments.length} total):`);
    shipments.forEach((s, i) => {
      console.log(`   ${i+1}. ID: ${s._id}`);
      console.log(`      Status: ${s.status}`);
      console.log(`      Fee: ${s.shippingFee?.total || 0}đ`);
    });
    console.log('');

    // Find earnings
    const earnings = await ShipperEarnings.find({ 
      shipperId: shipper._id 
    });

    console.log(`💰 Earnings (${earnings.length} records):`);
    let totalEarnings = 0;
    earnings.forEach((e, i) => {
      console.log(`   ${i+1}. Shipment: ${e.shipmentId}`);
      console.log(`      Amount: ${e.earnings.total.toLocaleString()}đ`);
      console.log(`      Status: ${e.status}`);
      console.log(`      Date: ${e.date || e.createdAt}`);
      totalEarnings += e.earnings.total;
    });
    
    console.log(`\n📊 Total Earnings: ${totalEarnings.toLocaleString()}đ`);

    // Test API query
    const apiEarnings = await ShipperEarnings.aggregate([
      { $match: { shipperId: shipper._id } },
      { $group: { _id: null, total: { $sum: '$earnings.total' } } }
    ]);

    console.log(`\n🔍 API Aggregate Result:`);
    console.log(`   Total: ${apiEarnings.length > 0 ? apiEarnings[0].total.toLocaleString() + 'đ' : '0đ'}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

debugShipperEarnings();
