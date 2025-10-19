require('dotenv').config();
const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const Shop = require('../models/Shop');

async function checkConversations() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Count total conversations
        const count = await Conversation.countDocuments();
        console.log(`\n📊 Total conversations: ${count}`);

        // Get all conversations
        const conversations = await Conversation.find()
            .populate('buyerId', 'fullName email')
            .populate('shopId', 'shopName')
            .lean();

        console.log('\n📋 All conversations:');
        conversations.forEach((conv, index) => {
            console.log(`\n${index + 1}. Conversation ID: ${conv._id}`);
            console.log(`   Buyer: ${conv.buyerId?.fullName || 'N/A'}`);
            console.log(`   Shop: ${conv.shopId?.shopName || 'N/A'}`);
            console.log(`   Messages count: ${conv.messages?.length || 0}`);
            console.log(`   Last message: ${conv.lastMessagePreview || 'N/A'}`);
            
            if (conv.messages && conv.messages.length > 0) {
                console.log(`   📨 Messages:`);
                conv.messages.forEach((msg, msgIndex) => {
                    console.log(`      ${msgIndex + 1}. [${msg.sender?.type}] ${msg.sender?.name}: ${msg.content}`);
                    console.log(`         Delivered: ${msg.deliveredAt}`);
                });
            }
        });

        // Get specific conversation
        const specificConvId = '68f4aa4d947b21a2ce5580ae';
        console.log(`\n\n🔍 Checking specific conversation: ${specificConvId}`);
        const specificConv = await Conversation.findById(specificConvId)
            .populate('buyerId', 'fullName email')
            .populate('shopId', 'shopName')
            .lean();

        if (specificConv) {
            console.log('✅ Found conversation:');
            console.log(JSON.stringify(specificConv, null, 2));
        } else {
            console.log('❌ Conversation not found');
        }

        await mongoose.connection.close();
        console.log('\n✅ Done');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkConversations();

