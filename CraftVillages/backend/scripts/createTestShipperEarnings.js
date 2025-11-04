const mongoose = require('mongoose');
require('dotenv').config();

const ShipperEarnings = require('../models/ShipperEarnings');
const Shipper = require('../models/Shipper');
const Order = require('../models/Order');
const Shipment = require('../models/Shipment');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/craftvillages', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});

async function createTestShipperEarnings() {
    try {
        console.log('\n📊 Creating Test Shipper Earnings...\n');

        // 1. Find a shipper
        const shipper = await Shipper.findOne();
        if (!shipper) {
            console.log('❌ No shipper found. Please create a shipper first.');
            process.exit(1);
        }
        console.log(`✅ Found shipper: ${shipper._id}`);

        // 2. Find completed shipments for this shipper
        const shipments = await Shipment.find({
            shipperId: shipper._id,
            status: 'DELIVERED'
        }).populate('orderId').limit(10);

        console.log(`✅ Found ${shipments.length} completed shipments`);

        if (shipments.length === 0) {
            console.log('⚠️  No completed shipments found. Creating sample earnings anyway...');
            
            // Create sample earnings without actual shipments
            const sampleDates = [];
            const today = new Date();
            
            // Create earnings for last 7 days
            for (let i = 0; i < 7; i++) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                
                const earning = new ShipperEarnings({
                    shipperId: shipper._id,
                    date: date,
                    earnings: {
                        baseFee: 15000 + Math.floor(Math.random() * 10000),
                        distanceFee: 5000 + Math.floor(Math.random() * 15000),
                        weightFee: 2000 + Math.floor(Math.random() * 5000),
                        bonus: Math.random() > 0.5 ? Math.floor(Math.random() * 10000) : 0,
                        deductions: 0,
                        total: 0  // Will calculate below
                    },
                    status: Math.random() > 0.3 ? 'COMPLETED' : 'PENDING',
                    paymentMethod: 'BANK_TRANSFER',
                    notes: `Sample earning for ${date.toLocaleDateString('vi-VN')}`
                });

                // Calculate total
                earning.earnings.total = 
                    earning.earnings.baseFee + 
                    earning.earnings.distanceFee + 
                    earning.earnings.weightFee + 
                    earning.earnings.bonus - 
                    earning.earnings.deductions;

                await earning.save();
                console.log(`   ✓ Created sample earning for ${date.toLocaleDateString('vi-VN')}: ${earning.earnings.total.toLocaleString()} VND`);
            }
        } else {
            // Create earnings from actual shipments
            let created = 0;
            
            for (const shipment of shipments) {
                // Check if earning already exists
                const existingEarning = await ShipperEarnings.findOne({
                    shipmentId: shipment._id
                });

                if (existingEarning) {
                    console.log(`   ⚠️  Earning already exists for shipment ${shipment._id}`);
                    continue;
                }

                // Create earning record
                const baseFee = shipment.shippingFee?.baseFee || 15000;
                const distanceFee = shipment.shippingFee?.distanceFee || 10000;
                const weightFee = shipment.shippingFee?.weightFee || 3000;
                const bonus = shipment.shippingFee?.bonus || 0;

                const earning = new ShipperEarnings({
                    shipperId: shipper._id,
                    orderId: shipment.orderId?._id,
                    shipmentId: shipment._id,
                    date: shipment.actualDeliveryTime || shipment.updatedAt || new Date(),
                    earnings: {
                        baseFee: baseFee,
                        distanceFee: distanceFee,
                        weightFee: weightFee,
                        bonus: bonus,
                        deductions: 0,
                        total: baseFee + distanceFee + weightFee + bonus
                    },
                    status: 'COMPLETED',
                    paymentMethod: 'BANK_TRANSFER',
                    notes: `Earnings from shipment ${shipment._id}`
                });

                await earning.save();
                created++;
                
                console.log(`   ✓ Created earning for shipment ${shipment._id}: ${earning.earnings.total.toLocaleString()} VND`);
            }

            console.log(`\n✅ Created ${created} earnings records from shipments`);
        }

        // 3. Calculate and show summary
        const allEarnings = await ShipperEarnings.find({ shipperId: shipper._id });
        
        const summary = {
            totalRecords: allEarnings.length,
            totalEarnings: 0,
            totalBonus: 0,
            totalDeductions: 0,
            completedOrders: 0,
            pendingOrders: 0
        };

        allEarnings.forEach(earning => {
            summary.totalEarnings += earning.earnings.total || 0;
            summary.totalBonus += earning.earnings.bonus || 0;
            summary.totalDeductions += earning.earnings.deductions || 0;
            
            if (earning.status === 'COMPLETED') {
                summary.completedOrders++;
            } else {
                summary.pendingOrders++;
            }
        });

        console.log('\n📊 Summary:');
        console.log('─────────────────────────────────────');
        console.log(`Total Records:      ${summary.totalRecords}`);
        console.log(`Total Earnings:     ${summary.totalEarnings.toLocaleString()} VND`);
        console.log(`Total Bonus:        ${summary.totalBonus.toLocaleString()} VND`);
        console.log(`Total Deductions:   ${summary.totalDeductions.toLocaleString()} VND`);
        console.log(`Completed Orders:   ${summary.completedOrders}`);
        console.log(`Pending Orders:     ${summary.pendingOrders}`);
        console.log('─────────────────────────────────────');

        // 4. Update shipper total earnings
        await Shipper.findByIdAndUpdate(shipper._id, {
            totalEarnings: summary.totalEarnings,
            totalDeliveries: summary.completedOrders
        });

        console.log('\n✅ Updated shipper total earnings');

        console.log('\n✨ Test shipper earnings created successfully!');
        console.log('\n📝 You can now:');
        console.log('   1. Go to Shipper Dashboard');
        console.log('   2. Click on "Chi tiết thu nhập"');
        console.log('   3. See the earnings data and charts');

    } catch (error) {
        console.error('❌ Error creating test shipper earnings:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 MongoDB connection closed');
        process.exit(0);
    }
}

// Run the script
createTestShipperEarnings();
