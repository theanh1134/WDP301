const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
require('dotenv').config();

// MongoDB connection string
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/WDP';

async function rebuildIndexes() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Step 1: Delete all conversations first (clean slate)
        console.log('\n🗑️  Deleting all existing conversations...');
        const deleteResult = await Conversation.deleteMany({});
        console.log(`✅ Deleted ${deleteResult.deletedCount} conversations`);

        // Step 2: Drop all indexes
        console.log('\n🔧 Dropping old indexes...');
        try {
            await Conversation.collection.dropIndexes();
            console.log('✅ Dropped all indexes');
        } catch (error) {
            console.log('⚠️  No indexes to drop or error:', error.message);
        }

        // Step 3: Rebuild indexes
        console.log('\n🔨 Rebuilding indexes...');
        await Conversation.syncIndexes();
        console.log('✅ Indexes rebuilt successfully');

        // Step 4: Show all indexes
        console.log('\n📋 Current indexes:');
        const indexes = await Conversation.collection.getIndexes();
        console.log(JSON.stringify(indexes, null, 2));

        console.log('\n✅ Done! Database is ready.');
        console.log('📊 Total conversations:', await Conversation.countDocuments());
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

rebuildIndexes();

