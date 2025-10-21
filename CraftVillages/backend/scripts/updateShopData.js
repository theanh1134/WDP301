const mongoose = require('mongoose');
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/WDP')
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

async function updateShopStatistics() {
    try {
        console.log('Starting shop data update...');

        // First, let's check products to find unique shopIds
        const products = await Product.find({}).select('shopId productName').lean();
        console.log(`Total products: ${products.length}`);
        if (products.length > 0) {
            console.log(`Sample product shopId:`, products[0].shopId);
        }
        const uniqueShopIds = [...new Set(products.map(p => p.shopId?.toString()).filter(Boolean))];
        console.log(`Found ${uniqueShopIds.length} unique shop IDs in products`);

        // Check if shops exist
        const shops = await Shop.find({});
        console.log(`Found ${shops.length} shops in database`);

        // If no shops exist, create them from product shopIds
        if (shops.length === 0 && uniqueShopIds.length > 0) {
            console.log('\nNo shops found. Creating shops from product data...');

            for (const shopId of uniqueShopIds) {
                const shopProducts = await Product.find({ shopId });
                const shopName = shopProducts[0]?.origin || `Shop ${shopId.substring(0, 8)}`;

                const newShop = new Shop({
                    _id: shopId,
                    sellerId: shopId, // Using shopId as sellerId for now
                    shopName,
                    description: `Chuyên cung cấp các sản phẩm thủ công chất lượng cao`,
                    bannerUrl: 'https://via.placeholder.com/1200x300?text=Shop+Banner',
                    isActive: true
                });

                await newShop.save();
                console.log(`  ✓ Created shop: ${shopName}`);
            }
        }

        const allShops = await Shop.find({});
        console.log(`\nTotal shops to update: ${allShops.length}`);

        for (const shop of allShops) {
            console.log(`\nUpdating shop: ${shop.shopName} (${shop._id})`);
            console.log(`  Current createdAt: ${shop.createdAt}`);

            // Count products
            const totalProducts = await Product.countDocuments({ shopId: shop._id });
            console.log(`  - Products: ${totalProducts}`);

            // Count orders - check items array for this shop's products
            const allOrders = await Order.find({});
            let totalOrders = 0;
            let completedOrders = 0;

            for (const order of allOrders) {
                const hasShopProduct = order.items?.some(item =>
                    item.shopId?.toString() === shop._id.toString()
                );
                if (hasShopProduct) {
                    totalOrders++;
                    if (order.status === 'Đã giao') {
                        completedOrders++;
                    }
                }
            }
            console.log(`  - Orders: ${totalOrders}, Completed: ${completedOrders}`);

            // Calculate average rating from reviews
            const shopProductIds = await Product.find({ shopId: shop._id }).select('_id');
            const productIds = shopProductIds.map(p => p._id);

            const reviews = await Review.find({ productId: { $in: productIds } });
            let totalRating = 0;
            let ratingCount = reviews.length;

            reviews.forEach(review => {
                totalRating += review.rating || 0;
            });

            const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;
            console.log(`  - Rating: ${averageRating.toFixed(1)} (${ratingCount} reviews)`);

            // Generate random but realistic data
            const followers = Math.floor(Math.random() * 150000) + 1000; // 1k - 150k
            const responseTimeOptions = ['trong vài phút', 'trong vài giờ', 'trong vài ngày'];
            const responseTime = responseTimeOptions[Math.floor(Math.random() * responseTimeOptions.length)];

            // Calculate actual time since creation
            const actualCreatedAt = shop.createdAt || new Date();
            const daysSinceCreation = Math.floor((new Date() - new Date(actualCreatedAt)) / (24 * 60 * 60 * 1000));
            const yearsSinceCreation = Math.floor(daysSinceCreation / 365);
            const monthsSinceCreation = Math.floor(daysSinceCreation / 30);

            // Update shop
            shop.statistics = {
                totalProducts,
                totalOrders,
                completedOrders,
                followers
            };

            shop.rating = {
                average: parseFloat(averageRating.toFixed(1)),
                count: ratingCount
            };

            shop.responseTime = responseTime;

            // Don't modify createdAt - keep the original
            // Use updateOne to avoid overriding createdAt
            await Shop.updateOne(
                { _id: shop._id },
                {
                    $set: {
                        statistics: shop.statistics,
                        rating: shop.rating,
                        responseTime: shop.responseTime
                    }
                }
            );
            console.log(`  ✓ Updated successfully`);
            console.log(`    - Followers: ${followers.toLocaleString()}`);
            console.log(`    - Response time: ${responseTime}`);
            if (yearsSinceCreation > 0) {
                console.log(`    - Tham gia: ${yearsSinceCreation} năm trước (${daysSinceCreation} ngày)`);
            } else if (monthsSinceCreation > 0) {
                console.log(`    - Tham gia: ${monthsSinceCreation} tháng trước (${daysSinceCreation} ngày)`);
            } else {
                console.log(`    - Tham gia: ${daysSinceCreation} ngày trước`);
            }
        }

        console.log('\n✅ All shops updated successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error updating shop data:', error);
        process.exit(1);
    }
}

// Run the update
updateShopStatistics();

