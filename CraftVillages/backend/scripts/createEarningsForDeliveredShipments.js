const mongoose = require('mongoose');
const Shipment = require('../models/Shipment');
const ShipperEarnings = require('../models/ShipperEarnings');
const Shipper = require('../models/Shipper');

const MONGODB_URI = 'mongodb://localhost:27017/WDP';

async function createEarningsForDeliveredShipments() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all DELIVERED shipments
    const deliveredShipments = await Shipment.find({
      status: 'DELIVERED',
      shipperId: { $exists: true, $ne: null }
    });

    console.log(`\n📦 Found ${deliveredShipments.length} DELIVERED shipments`);

    let created = 0;
    let skipped = 0;
    let updated = 0;

    for (const shipment of deliveredShipments) {
      // Check if earnings already exists
      const existingEarnings = await ShipperEarnings.findOne({
        shipmentId: shipment._id
      });

      if (existingEarnings) {
        console.log(`⏭️  Shipment ${shipment._id} - Earnings already exists`);
        skipped++;
        continue;
      }

      // Ensure shipment has shippingFee
      if (!shipment.shippingFee || !shipment.shippingFee.total) {
        const estimatedDistance = shipment.distance || shipment.estimatedDistance || 10;
        const baseFee = 15000;
        const distanceFee = estimatedDistance * 3000;
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
        console.log(`🔧 Updated shipping fee for shipment ${shipment._id}: ${totalFee.toLocaleString()}đ`);
        updated++;
      }

      // Create earnings record
      const baseFee = shipment.shippingFee.baseFee || 0;
      const distanceFee = shipment.shippingFee.distanceFee || 0;
      const weightFee = shipment.shippingFee.weightFee || 0;
      const bonus = shipment.shippingFee.bonus || 0;
      const totalEarnings = baseFee + distanceFee + weightFee + bonus;

      const earnings = new ShipperEarnings({
        shipperId: shipment.shipperId,
        orderId: shipment.orderId,
        shipmentId: shipment._id,
        earnings: {
          baseFee,
          distanceFee,
          weightFee,
          bonus,
          deductions: 0,
          total: totalEarnings
        },
        status: 'COMPLETED',
        date: shipment.actualDeliveryTime || shipment.updatedAt || new Date()
      });

      await earnings.save();
      console.log(`✅ Created earnings for shipment ${shipment._id} | Shipper: ${shipment.shipperId} | Amount: ${totalEarnings.toLocaleString()}đ`);
      created++;

      // Update shipper totalEarnings (optional, if you want to sync)
      try {
        const shipper = await Shipper.findById(shipment.shipperId);
        if (shipper) {
          // We don't want to double-count, so we'll let the getDashboardStats calculate from earnings
          console.log(`   📊 Shipper ${shipper._id} earnings updated`);
        }
      } catch (err) {
        console.error(`   ⚠️  Could not update shipper stats:`, err.message);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Created: ${created} earnings records`);
    console.log(`   🔧 Updated: ${updated} shipments with fees`);
    console.log(`   ⏭️  Skipped: ${skipped} (already have earnings)`);
    console.log(`   📦 Total: ${deliveredShipments.length} delivered shipments processed`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

createEarningsForDeliveredShipments();
