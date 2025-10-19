const mongoose = require('mongoose');
const Shop = require('../models/Shop');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/WDP')
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

async function checkShopBanners() {
    try {
        console.log('Checking shop banners...\n');

        const shops = await Shop.find({});
        
        for (const shop of shops) {
            console.log(`Shop: ${shop.shopName}`);
            console.log(`  bannerUrl: ${shop.bannerUrl}`);
            console.log('');
        }

        console.log('✅ Done!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkShopBanners();

