const mongoose = require('mongoose');
const Shipment = require('../models/Shipment');

const MONGODB_URI = 'mongodb://localhost:27017/WDP';

async function addShippingFeeToExistingShipments() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all shipments without shipping fee
    const shipments = await Shipment.find({
      $or: [
        { 'shippingFee.total': { $exists: false } },
        { 'shippingFee.total': 0 },
        { 'shippingFee.total': null }
      ]
    });

    console.log(`\n📦 Found ${shipments.length} shipments without shipping fee`);

    let updated = 0;

    for (const shipment of shipments) {
      const estimatedDistance = shipment.distance || shipment.estimatedDistance || 10;
      const baseFee = 15000; // 15k base
      const distanceFee = estimatedDistance * 3000; // 3k per km
      const totalFee = baseFee + distanceFee;

      shipment.shippingFee = {
        baseFee: baseFee,
        distanceFee: distanceFee,
        weightFee: 0,
        bonus: 0,
        total: totalFee
      };

      if (!shipment.distance) {
        shipment.distance = estimatedDistance;
      }

      await shipment.save();
      console.log(`✅ Updated shipment ${shipment._id} | Fee: ${totalFee.toLocaleString()}đ (${estimatedDistance}km)`);
      updated++;
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Updated: ${updated} shipments`);
    console.log(`   💰 Formula: 15,000đ base + 3,000đ/km`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

addShippingFeeToExistingShipments();
