const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/craftvillages', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});

const Product = require('../models/Product');

async function updateProductViews() {
    try {
        console.log('🔄 Updating products with views field...');
        
        // Update all products that don't have views field or have null/undefined views
        const result = await Product.updateMany(
            { $or: [{ views: { $exists: false } }, { views: null }] },
            { $set: { views: 0 } }
        );

        console.log(`✅ Updated ${result.modifiedCount} products with views = 0`);
        
        // Show some sample products
        const sampleProducts = await Product.find({}).limit(5).select('productName views');
        console.log('\n📊 Sample products:');
        sampleProducts.forEach(p => {
            console.log(`  - ${p.productName}: ${p.views} views`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating products:', error);
        process.exit(1);
    }
}

updateProductViews();

