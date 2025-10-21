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

async function addTestViews() {
    try {
        console.log('🔄 Adding test views to products...');
        
        // Get all products
        const products = await Product.find({});
        
        console.log(`Found ${products.length} products`);
        
        // Add random views to each product (between 10 and 500)
        for (const product of products) {
            const randomViews = Math.floor(Math.random() * 491) + 10; // 10-500
            product.views = randomViews;
            await product.save();
            console.log(`  ✓ ${product.productName}: ${randomViews} views`);
        }

        console.log('\n✅ Successfully added test views to all products!');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding test views:', error);
        process.exit(1);
    }
}

addTestViews();

