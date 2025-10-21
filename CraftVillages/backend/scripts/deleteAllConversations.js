const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
require('dotenv').config();

// MongoDB connection string
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/WDP';

async function deleteAllConversations() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const count = await Conversation.countDocuments();
        console.log(`📊 Total conversations: ${count}`);

        if (count > 0) {
            console.log('🗑️  Deleting all conversations...');
            const result = await Conversation.deleteMany({});
            console.log(`✅ Deleted ${result.deletedCount} conversations`);
        } else {
            console.log('✅ No conversations to delete!');
        }

        console.log(`\n📊 Final count: ${await Conversation.countDocuments()} conversations`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

deleteAllConversations();

