const mongoose = require('mongoose');
const Shop = require('../models/Shop');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/WDP')
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

async function setShopCreationDates() {
    try {
        console.log('Setting shop creation dates...\n');

        const shops = await Shop.find({});
        console.log(`Found ${shops.length} shops\n`);

        // Define creation dates for each shop (you can customize these)
        // Set yearsAgo: 0 to keep current date (for new shops)
        const shopDates = [
            { name: 'Thổ Cẩm Tây Bắc', yearsAgo: 5 },
            { name: 'Mây Tre Quê Nhà', yearsAgo: 8 },
            { name: 'Thế Anh', yearsAgo: 0 } // Keep current date - shop mới
        ];

        for (const shop of shops) {
            // Find matching date config or use random
            const dateConfig = shopDates.find(d => shop.shopName.includes(d.name));
            const yearsAgo = dateConfig ? dateConfig.yearsAgo : Math.floor(Math.random() * 10) + 1;

            // If yearsAgo is 0, set to current date (for new shops)
            if (yearsAgo === 0) {
                const now = new Date();

                // Use raw MongoDB collection to set to current date
                const result = await mongoose.connection.collection('shops').updateOne(
                    { _id: shop._id },
                    { $set: { createdAt: now } }
                );

                const updatedShop = await Shop.findById(shop._id);

                console.log(`✓ ${shop.shopName} (NEW SHOP)`);
                console.log(`  Set to current date: ${updatedShop.createdAt.toLocaleDateString('vi-VN')}`);
                console.log('');
                continue;
            }

            const createdAt = new Date();
            createdAt.setFullYear(createdAt.getFullYear() - yearsAgo);

            // Add some random months/days for variety
            const randomMonths = Math.floor(Math.random() * 12);
            const randomDays = Math.floor(Math.random() * 30);
            createdAt.setMonth(createdAt.getMonth() - randomMonths);
            createdAt.setDate(createdAt.getDate() - randomDays);

            // Use raw MongoDB collection to bypass Mongoose timestamps
            const result = await mongoose.connection.collection('shops').updateOne(
                { _id: shop._id },
                { $set: { createdAt: createdAt } }
            );

            // Verify the update
            const updatedShop = await Shop.findById(shop._id);

            console.log(`✓ ${shop.shopName}`);
            console.log(`  Wanted: ${createdAt.toLocaleDateString('vi-VN')} (${yearsAgo} năm trước)`);
            console.log(`  Actual: ${updatedShop.createdAt.toLocaleDateString('vi-VN')}`);
            console.log(`  Update result:`, result);
            console.log('');
        }

        console.log('✅ All shop creation dates updated!');
        console.log('\nBây giờ chạy lại: node backend/scripts/updateShopData.js');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

setShopCreationDates();

