require('dotenv').config();
const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const Shop = require('../models/Shop');

async function debugConversations() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const conversations = await Conversation.find().lean();
        
        console.log('\n📋 All conversations with details:');
        conversations.forEach((conv, index) => {
            console.log(`\n${index + 1}. Conversation ${conv._id}:`);
            console.log(`   buyerId: ${conv.buyerId}`);
            console.log(`   shopId: ${conv.shopId}`);
            console.log(`   status: ${conv.status}`);
            console.log(`   messages: ${conv.messages.length}`);
            console.log(`   createdAt: ${conv.createdAt}`);
        });

        // Check if they are truly duplicates
        console.log('\n🔍 Checking for exact duplicates (same buyerId + shopId + status):');
        const map = new Map();
        
        conversations.forEach(conv => {
            const key = `${conv.buyerId.toString()}_${conv.shopId.toString()}_${conv.status}`;
            if (!map.has(key)) {
                map.set(key, []);
            }
            map.get(key).push(conv);
        });

        let hasDuplicates = false;
        for (const [key, convs] of map.entries()) {
            if (convs.length > 1) {
                hasDuplicates = true;
                console.log(`\n❌ Found ${convs.length} conversations with key: ${key}`);
                convs.forEach(c => {
                    console.log(`   - ${c._id} (${c.messages.length} messages, created: ${c.createdAt})`);
                });
            }
        }

        if (!hasDuplicates) {
            console.log('\n✅ No exact duplicates found!');
            console.log('\n💡 These are different conversations (different status or other fields)');
        }

        await mongoose.connection.close();
        console.log('\n✅ Done!');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

debugConversations();

