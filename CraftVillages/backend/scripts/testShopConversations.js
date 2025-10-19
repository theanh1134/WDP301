const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const Shop = require('../models/Shop');

async function testShopConversations() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const shopId = '68f2168ce7bacf814c0019ce'; // Shop "Thế Anh"
        
        console.log(`\n🔍 Testing getByShop for shopId: ${shopId}`);
        
        // Test 1: Raw query
        console.log('\n1️⃣ Raw query:');
        const rawConvs = await Conversation.find({ shopId }).lean();
        console.log(`   Found ${rawConvs.length} conversations`);
        rawConvs.forEach((conv, i) => {
            console.log(`   ${i + 1}. ${conv._id} - buyerId: ${conv.buyerId}`);
        });
        
        // Test 2: Using static method
        console.log('\n2️⃣ Using Conversation.getByShop():');
        const methodConvs = await Conversation.getByShop(shopId);
        console.log(`   Found ${methodConvs.length} conversations`);
        methodConvs.forEach((conv, i) => {
            console.log(`   ${i + 1}. ${conv._id} - buyer: ${conv.buyerId?.fullName || 'N/A'}`);
        });
        
        // Test 3: Check if shopId is ObjectId or string
        console.log('\n3️⃣ Testing with ObjectId:');
        const objectIdConvs = await Conversation.find({ shopId: new mongoose.Types.ObjectId(shopId) }).lean();
        console.log(`   Found ${objectIdConvs.length} conversations`);
        
        await mongoose.connection.close();
        console.log('\n✅ Done!');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

testShopConversations();

