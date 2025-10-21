/**
 * Migration Script: Conversation Schema v1 -> v2
 * 
 * Chạy script này để migrate từ schema cũ sang schema mới
 * 
 * Usage:
 *   node backend/scripts/migrateConversations.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const Shop = require('../models/Shop');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/craftvillages', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function migrateConversations() {
    try {
        console.log('🚀 Starting conversation migration...\n');

        const conversations = await Conversation.find({}).lean();
        console.log(`📊 Found ${conversations.length} conversations to migrate\n`);

        let successCount = 0;
        let errorCount = 0;

        for (const conv of conversations) {
            try {
                console.log(`Processing conversation ${conv._id}...`);

                const updates = {};

                // 1. Set default conversationType
                if (!conv.conversationType) {
                    updates.conversationType = 'GENERAL';
                    console.log('  ✅ Set conversationType: GENERAL');
                }

                // 2. Calculate unreadCount
                const buyerUnread = conv.messages.filter(m => !m.readAt && m.sender.type === 'SHOP_STAFF').length;
                const shopUnread = conv.messages.filter(m => !m.readAt && m.sender.type === 'USER').length;
                
                updates['unreadCount.buyer'] = buyerUnread;
                updates['unreadCount.shop'] = shopUnread;
                console.log(`  ✅ Set unreadCount: buyer=${buyerUnread}, shop=${shopUnread}`);

                // 3. Set lastMessagePreview and lastMessageSender
                const lastMsg = conv.messages[conv.messages.length - 1];
                if (lastMsg) {
                    updates.lastMessagePreview = lastMsg.content.substring(0, 100);
                    updates.lastMessageSender = lastMsg.sender.type;
                    console.log(`  ✅ Set lastMessagePreview: "${updates.lastMessagePreview.substring(0, 30)}..."`);
                }

                // 4. Set default priority
                if (!conv.priority) {
                    updates.priority = 'NORMAL';
                    console.log('  ✅ Set priority: NORMAL');
                }

                // 5. Set default tags
                if (!conv.tags) {
                    updates.tags = [];
                }

                // 6. Set archive flags
                if (conv.isArchivedByBuyer === undefined) {
                    updates.isArchivedByBuyer = false;
                }
                if (conv.isArchivedByShop === undefined) {
                    updates.isArchivedByShop = false;
                }

                // 7. Update messages
                const updatedMessages = [];
                for (const msg of conv.messages) {
                    const updatedMsg = { ...msg };

                    // Set default messageType
                    if (!updatedMsg.messageType) {
                        updatedMsg.messageType = 'TEXT';
                    }

                    // Cache sender info
                    if (updatedMsg.sender.type === 'USER' && updatedMsg.sender.userId) {
                        try {
                            const user = await User.findById(updatedMsg.sender.userId).lean();
                            if (user) {
                                updatedMsg.sender.name = user.fullName || user.username;
                                updatedMsg.sender.avatar = user.avatar || null;
                                console.log(`  ✅ Cached user info: ${updatedMsg.sender.name}`);
                            }
                        } catch (err) {
                            console.log(`  ⚠️  Could not find user ${updatedMsg.sender.userId}`);
                        }
                    } else if (updatedMsg.sender.type === 'SHOP_STAFF' && updatedMsg.sender.shopId) {
                        try {
                            const shop = await Shop.findById(updatedMsg.sender.shopId).lean();
                            if (shop) {
                                updatedMsg.sender.name = shop.shopName;
                                updatedMsg.sender.avatar = shop.avatar || null;
                                console.log(`  ✅ Cached shop info: ${updatedMsg.sender.name}`);
                            }
                        } catch (err) {
                            console.log(`  ⚠️  Could not find shop ${updatedMsg.sender.shopId}`);
                        }
                    }

                    // Set default values for new fields
                    if (updatedMsg.isEdited === undefined) {
                        updatedMsg.isEdited = false;
                    }
                    if (!updatedMsg.editedAt) {
                        updatedMsg.editedAt = null;
                    }
                    if (!updatedMsg.deletedAt) {
                        updatedMsg.deletedAt = null;
                    }
                    if (!updatedMsg.replyTo) {
                        updatedMsg.replyTo = null;
                    }

                    updatedMessages.push(updatedMsg);
                }

                updates.messages = updatedMessages;

                // Apply updates
                await Conversation.updateOne({ _id: conv._id }, { $set: updates });

                successCount++;
                console.log(`✅ Successfully migrated conversation ${conv._id}\n`);

            } catch (error) {
                errorCount++;
                console.error(`❌ Error migrating conversation ${conv._id}:`, error.message);
                console.error(error.stack);
                console.log('');
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 Migration Summary:');
        console.log('='.repeat(60));
        console.log(`✅ Success: ${successCount}`);
        console.log(`❌ Errors: ${errorCount}`);
        console.log(`📝 Total: ${conversations.length}`);
        console.log('='.repeat(60));

        if (errorCount === 0) {
            console.log('\n🎉 Migration completed successfully!');
        } else {
            console.log('\n⚠️  Migration completed with errors. Please review the logs above.');
        }

    } catch (error) {
        console.error('❌ Fatal error during migration:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed.');
        process.exit(0);
    }
}

// Run migration
migrateConversations();

