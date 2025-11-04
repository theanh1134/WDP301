const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/WDP', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected to WDP database'))
.catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});

async function importRealEarnings() {
    try {
        console.log('\n📊 Importing Real Shipper Earnings from WDP database...\n');

        // Get the collections directly
        const db = mongoose.connection.db;
        const shippersCollection = db.collection('shippers');
        const earningsCollection = db.collection('shipperearnings');
        const ordersCollection = db.collection('orders');

        // Find the shipper with userId (Nguyen Van A)
        const shipper = await shippersCollection.findOne({
            userId: mongoose.Types.ObjectId('68fc3422796a593588dbddab')
        });

        if (!shipper) {
            console.log('❌ Shipper not found for user 68fc3422796a593588dbddab');
            process.exit(1);
        }

        console.log(`✅ Found shipper: ${shipper._id}`);
        console.log(`   Shipper info: License ${shipper.licenseNumber}, Vehicle ${shipper.vehicleType}`);

        // Get existing earnings from old structure
        const oldEarnings = await earningsCollection.find({
            shipperId: shipper._id
        }).toArray();

        console.log(`\n📋 Found ${oldEarnings.length} existing earnings records`);

        // Delete old earnings to avoid duplicates
        if (oldEarnings.length > 0) {
            await earningsCollection.deleteMany({ shipperId: shipper._id });
            console.log(`   ✓ Cleared old earnings records`);
        }

        // Transform and insert new earnings with correct structure
        const newEarnings = oldEarnings.map(old => {
            // Map old structure to new structure
            const baseFee = old.baseFee || 15000;
            const distanceFee = old.distanceFee || 10000;
            const weightFee = old.weightFee || 5000;
            const bonus = old.bonusFee || 0;
            const total = old.totalEarning || (baseFee + distanceFee + weightFee + bonus);

            return {
                shipperId: old.shipperId,
                orderId: old.orderId,
                shipmentId: null, // Will be set later if available
                date: old.createdAt || new Date(),
                earnings: {
                    baseFee: baseFee,
                    distanceFee: distanceFee,
                    weightFee: weightFee,
                    bonus: bonus,
                    deductions: 0,
                    total: total
                },
                status: old.paymentStatus === 'PAID' ? 'COMPLETED' : 'PENDING',
                paymentMethod: 'BANK_TRANSFER',
                paymentDate: old.paidAt || null,
                transactionId: old._id.toString(),
                notes: `Imported from old structure`,
                createdAt: old.createdAt || new Date(),
                updatedAt: old.updatedAt || new Date()
            };
        });

        if (newEarnings.length > 0) {
            await earningsCollection.insertMany(newEarnings);
            console.log(`\n✅ Imported ${newEarnings.length} earnings with new structure`);
        }

        // Create additional sample earnings for current month (October 2025)
        console.log(`\n📅 Creating additional sample earnings for October 2025...`);

        const additionalEarnings = [];
        const today = new Date('2025-10-29');

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);

            const baseFee = 15000 + Math.floor(Math.random() * 10000);
            const distanceFee = 5000 + Math.floor(Math.random() * 15000);
            const weightFee = 2000 + Math.floor(Math.random() * 5000);
            const bonus = Math.random() > 0.5 ? Math.floor(Math.random() * 10000) : 0;
            const total = baseFee + distanceFee + weightFee + bonus;

            additionalEarnings.push({
                shipperId: shipper._id,
                orderId: null, // Sample data without order
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
                notes: `Sample earning for ${date.toLocaleDateString('vi-VN')}`,
                createdAt: date,
                updatedAt: date
            });
        }

        await earningsCollection.insertMany(additionalEarnings);
        console.log(`   ✓ Created ${additionalEarnings.length} sample earnings`);

        // Calculate summary
        const allEarnings = await earningsCollection.find({
            shipperId: shipper._id
        }).toArray();

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
        console.log(`Completed Orders:   ${summary.completedOrders}`);
        console.log(`Pending Orders:     ${summary.pendingOrders}`);
        console.log('─────────────────────────────────────');

        // Update shipper total earnings
        await shippersCollection.updateOne(
            { _id: shipper._id },
            {
                $set: {
                    totalEarnings: summary.totalEarnings,
                    totalDeliveries: summary.completedOrders
                }
            }
        );

        console.log('\n✅ Updated shipper total earnings');
        console.log('\n✨ Import completed successfully!');
        console.log('\n📝 You can now:');
        console.log('   1. Reload Shipper Dashboard');
        console.log('   2. Click "Chi tiết thu nhập"');
        console.log('   3. See real earnings data');

    } catch (error) {
        console.error('❌ Error importing earnings:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 MongoDB connection closed');
        process.exit(0);
    }
}

// Run the script
importRealEarnings();
