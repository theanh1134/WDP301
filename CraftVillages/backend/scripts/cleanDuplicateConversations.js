const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
require('dotenv').config();

// MongoDB connection string
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/WDP';

async function cleanDuplicateConversations() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find all conversations grouped by buyerId and shopId (ignore productId)
        const conversations = await Conversation.find({})
            .sort({ createdAt: 1 }); // Oldest first

        console.log(`📊 Total conversations: ${conversations.length}`);

        const uniqueMap = new Map();
        const duplicates = [];
        const mergeMessages = new Map(); // Store messages to merge

        for (const conv of conversations) {
            const key = `${conv.buyerId}_${conv.shopId}`;

            if (uniqueMap.has(key)) {
                // This is a duplicate - merge messages into the first one
                duplicates.push(conv._id);
                console.log(`🔍 Found duplicate: ${conv._id} (buyer: ${conv.buyerId}, shop: ${conv.shopId})`);

                // Store messages to merge
                if (conv.messages && conv.messages.length > 0) {
                    const firstConvId = uniqueMap.get(key);
                    if (!mergeMessages.has(firstConvId)) {
                        mergeMessages.set(firstConvId, []);
                    }
                    mergeMessages.get(firstConvId).push(...conv.messages);
                }
            } else {
                // Keep the first one (oldest)
                uniqueMap.set(key, conv._id);
            }
        }

        // Merge messages into the first conversation
        for (const [convId, messages] of mergeMessages.entries()) {
            if (messages.length > 0) {
                console.log(`📝 Merging ${messages.length} messages into conversation ${convId}`);
                await Conversation.findByIdAndUpdate(convId, {
                    $push: { messages: { $each: messages } }
                });
            }
        }

        if (duplicates.length > 0) {
            console.log(`\n🗑️  Deleting ${duplicates.length} duplicate conversations...`);
            const result = await Conversation.deleteMany({ _id: { $in: duplicates } });
            console.log(`✅ Deleted ${result.deletedCount} duplicate conversations`);
        } else {
            console.log('✅ No duplicates found!');
        }

        console.log(`\n📊 Final count: ${await Conversation.countDocuments()} conversations`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

cleanDuplicateConversations();

