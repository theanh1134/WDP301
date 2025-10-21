require('dotenv').config();
const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const Shop = require('../models/Shop');

async function fixDuplicateConversations() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Tìm tất cả conversations
        const conversations = await Conversation.find().lean();
        console.log(`\n📊 Total conversations: ${conversations.length}`);

        // Group by buyerId + shopId
        const groups = {};
        conversations.forEach(conv => {
            const key = `${conv.buyerId}_${conv.shopId}`;
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(conv);
        });

        console.log('\n🔍 Checking for duplicates...');
        let duplicatesFound = 0;

        for (const [key, convs] of Object.entries(groups)) {
            if (convs.length > 1) {
                duplicatesFound++;
                console.log(`\n❌ Found ${convs.length} duplicate conversations for ${key}:`);
                
                // Sắp xếp theo createdAt (giữ cái cũ nhất)
                convs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                
                const keepConv = convs[0];
                const deleteConvs = convs.slice(1);
                
                console.log(`   ✅ Keeping: ${keepConv._id} (created: ${keepConv.createdAt})`);
                console.log(`   ❌ Deleting ${deleteConvs.length} duplicates:`);
                
                // Merge messages từ các conversations bị xóa vào conversation được giữ lại
                let allMessages = [...keepConv.messages];
                
                for (const delConv of deleteConvs) {
                    console.log(`      - ${delConv._id} (${delConv.messages.length} messages)`);
                    allMessages = allMessages.concat(delConv.messages);
                }
                
                // Sắp xếp messages theo thời gian
                allMessages.sort((a, b) => new Date(a.deliveredAt) - new Date(b.deliveredAt));
                
                // Update conversation được giữ lại
                const lastMessage = allMessages[allMessages.length - 1];
                await Conversation.findByIdAndUpdate(keepConv._id, {
                    messages: allMessages,
                    lastMessageAt: lastMessage?.deliveredAt || keepConv.lastMessageAt,
                    lastMessagePreview: lastMessage?.content || keepConv.lastMessagePreview,
                    lastMessageSender: lastMessage?.sender?.type || keepConv.lastMessageSender,
                    'unreadCount.shop': allMessages.filter(m => m.sender.type === 'USER' && !m.readAt).length,
                    'unreadCount.buyer': allMessages.filter(m => m.sender.type === 'SHOP_STAFF' && !m.readAt).length
                });
                
                console.log(`   ✅ Merged ${allMessages.length} total messages into ${keepConv._id}`);
                
                // Xóa các conversations trùng lặp
                for (const delConv of deleteConvs) {
                    await Conversation.findByIdAndDelete(delConv._id);
                }
                
                console.log(`   ✅ Deleted ${deleteConvs.length} duplicate conversations`);
            }
        }

        if (duplicatesFound === 0) {
            console.log('\n✅ No duplicates found!');
        } else {
            console.log(`\n✅ Fixed ${duplicatesFound} duplicate groups`);
        }

        // Drop existing indexes
        console.log('\n🔧 Dropping old indexes...');
        try {
            await Conversation.collection.dropIndex('buyerId_1_shopId_1_status_1');
            console.log('✅ Dropped index: buyerId_1_shopId_1_status_1');
        } catch (err) {
            console.log('⚠️ Index buyerId_1_shopId_1_status_1 does not exist');
        }

        // Create new unique index
        console.log('\n🔧 Creating unique index...');
        await Conversation.collection.createIndex(
            { buyerId: 1, shopId: 1, status: 1 },
            { unique: true, name: 'unique_buyer_shop_status' }
        );
        console.log('✅ Created unique index: unique_buyer_shop_status');

        // Verify final state
        const finalCount = await Conversation.countDocuments();
        console.log(`\n📊 Final conversation count: ${finalCount}`);

        const finalConvs = await Conversation.find()
            .populate('buyerId', 'fullName')
            .populate('shopId', 'shopName')
            .lean();

        console.log('\n📋 Final conversations:');
        finalConvs.forEach((conv, index) => {
            console.log(`${index + 1}. ${conv.buyerId?.fullName} ↔ ${conv.shopId?.shopName} (${conv.messages.length} messages)`);
        });

        await mongoose.connection.close();
        console.log('\n✅ Done!');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixDuplicateConversations();

