const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

async function migrateInventoryBatches() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/WDP';
        console.log('Connecting to:', mongoUri);

        await mongoose.connect(mongoUri);

        console.log('Connected to MongoDB');

        // Find all products
        const products = await Product.find({});
        console.log(`Found ${products.length} products to migrate`);

        let migratedCount = 0;
        let skippedCount = 0;

        for (const product of products) {
            let needsUpdate = false;

            // Check each inventory batch
            for (const batch of product.inventoryBatches) {
                if (!batch.sellingPrice) {
                    // Add sellingPrice from product's sellingPrice
                    batch.sellingPrice = product.sellingPrice;
                    needsUpdate = true;
                }
            }

            if (needsUpdate) {
                await product.save();
                migratedCount++;
                console.log(`✅ Migrated product: ${product.productName} (${product._id})`);
            } else {
                skippedCount++;
            }
        }

        console.log('\n=== Migration Complete ===');
        console.log(`✅ Migrated: ${migratedCount} products`);
        console.log(`⏭️  Skipped: ${skippedCount} products (already have sellingPrice)`);

        await mongoose.connection.close();
        console.log('Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
}

migrateInventoryBatches();

