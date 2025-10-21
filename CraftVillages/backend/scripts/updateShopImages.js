const mongoose = require('mongoose');
const Shop = require('../models/Shop');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/WDP')
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

async function updateShopImages() {
    try {
        console.log('Updating shop images...\n');

        const shops = await Shop.find({});
        console.log(`Found ${shops.length} shops\n`);

        // Sample avatar images for different shop types
        const avatarImages = [
            'https://via.placeholder.com/150/b8860b/ffffff?text=TC', // Thổ Cẩm
            'https://via.placeholder.com/150/8b4513/ffffff?text=MT', // Mây Tre
            'https://via.placeholder.com/150/d4af37/ffffff?text=TC', // Thổ Cẩm
            'https://via.placeholder.com/150/cd853f/ffffff?text=TA'  // Thế Anh
        ];

        const bannerImages = [
            'https://via.placeholder.com/1200x300/b8860b/ffffff?text=Tho+Cam+Tay+Bac',
            'https://via.placeholder.com/1200x300/8b4513/ffffff?text=May+Tre+Que+Nha',
            'https://via.placeholder.com/1200x300/d4af37/ffffff?text=Tho+Cam+Tay+Bac',
            'https://via.placeholder.com/1200x300/cd853f/ffffff?text=The+Anh'
        ];

        for (let i = 0; i < shops.length; i++) {
            const shop = shops[i];
            
            // Update using raw MongoDB to avoid validation issues
            await mongoose.connection.collection('shops').updateOne(
                { _id: shop._id },
                {
                    $set: {
                        avatarUrl: avatarImages[i] || 'https://via.placeholder.com/150?text=Shop',
                        bannerUrl: bannerImages[i] || 'https://via.placeholder.com/1200x300?text=Shop+Banner'
                    }
                }
            );

            const updatedShop = await Shop.findById(shop._id);
            
            console.log(`✓ ${shop.shopName}`);
            console.log(`  avatarUrl: ${updatedShop.avatarUrl}`);
            console.log(`  bannerUrl: ${updatedShop.bannerUrl}`);
            console.log('');
        }

        console.log('✅ All shop images updated!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

updateShopImages();

