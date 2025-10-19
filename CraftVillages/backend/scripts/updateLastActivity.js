const mongoose = require('mongoose');
const Shop = require('../models/Shop');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/WDP')
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

async function updateLastActivity() {
    try {
        console.log('Updating lastActivityAt for shops...\n');

        const shops = await Shop.find({});
        console.log(`Found ${shops.length} shops\n`);

        for (const shop of shops) {
            // Set lastActivityAt to current date for all shops
            // This represents when the shop was last active
            const lastActivityAt = new Date();
            
            // Use raw MongoDB collection to update
            await mongoose.connection.collection('shops').updateOne(
                { _id: shop._id },
                { $set: { lastActivityAt: lastActivityAt } }
            );

            const updatedShop = await Shop.findById(shop._id);
            
            // Calculate time difference
            const createdAt = new Date(updatedShop.createdAt);
            const daysDiff = Math.floor((lastActivityAt - createdAt) / (24 * 60 * 60 * 1000));
            const years = Math.floor(daysDiff / 365);
            
            console.log(`✓ ${shop.shopName}`);
            console.log(`  createdAt: ${createdAt.toLocaleDateString('vi-VN')}`);
            console.log(`  lastActivityAt: ${lastActivityAt.toLocaleDateString('vi-VN')}`);
            console.log(`  Difference: ${daysDiff} days (${years} years)`);
            console.log(`  Display: ${years < 1 ? 'mới tham gia' : `${years} năm trước`}`);
            console.log('');
        }

        console.log('✅ All shops updated!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

updateLastActivity();

