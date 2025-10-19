const Conversation = require('../models/Conversation');
const User = require('../models/User');
const Shop = require('../models/Shop');

// Get conversations by buyer
const getConversationsByBuyer = async (req, res) => {
    try {
        const { buyerId } = req.params;
        const { includeArchived } = req.query;

        const conversations = await Conversation.getByBuyer(
            buyerId,
            includeArchived === 'true'
        );

        res.json({
            success: true,
            data: conversations
        });
    } catch (error) {
        console.error('Error fetching buyer conversations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch conversations',
            error: error.message
        });
    }
};

// Get conversations by shop
const getConversationsByShop = async (req, res) => {
    try {
        const { shopId } = req.params;
        const { includeArchived } = req.query;

        console.log(`🏪 getConversationsByShop called with shopId: ${shopId}`);

        const conversations = await Conversation.getByShop(
            shopId,
            includeArchived === 'true'
        );

        console.log(`✅ Found ${conversations.length} conversations for shop ${shopId}`);

        res.json({
            success: true,
            data: conversations
        });
    } catch (error) {
        console.error('❌ Error fetching shop conversations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch conversations',
            error: error.message
        });
    }
};

const getConversationsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const { includeArchived } = req.query;

        console.log(`👤 getConversationsByUserId called with userId: ${userId}`);

        // Kiểm tra xem userId này có phải là seller không (có shop không)
        const Shop = require('../models/Shop');
        const shop = await Shop.findOne({ sellerId: userId });

        let conversations = [];

        if (shop) {
            // Nếu là seller, tìm conversations theo shopId
            console.log(`🏪 User is seller, found shop: ${shop._id} (${shop.shopName})`);
            conversations = await Conversation.getByShop(
                shop._id,
                includeArchived === 'true'
            );
        } else {
            // Nếu không phải seller, tìm conversations theo buyerId
            console.log(`👤 User is buyer, finding conversations by buyerId`);
            conversations = await Conversation.getByBuyer(
                userId,
                includeArchived === 'true'
            );
        }

        console.log(`✅ Found ${conversations.length} conversations for userId ${userId}`);

        res.json({
            success: true,
            data: conversations
        });
    } catch (error) {
        console.error('❌ Error fetching conversations by userId:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch conversations',
            error: error.message
        });
    }
};

// Get conversation by ID
const getConversationById = async (req, res) => {
    try {
        const { conversationId } = req.params;

        const conversation = await Conversation.findById(conversationId)
            .populate('buyerId', 'fullName avatar email')
            .populate('shopId', 'shopName avatar')
            .populate('orderId', '_id status')
            .populate('productId', 'productName thumbnailUrl');

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        res.json({
            success: true,
            data: conversation
        });
    } catch (error) {
        console.error('Error fetching conversation:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch conversation',
            error: error.message
        });
    }
};

// Create new conversation
const createConversation = async (req, res) => {
    try {
        const {
            buyerId,
            shopId,
            conversationType,
            productId,
            orderId,
            subject,
            initialMessage
        } = req.body;

        // Check if conversation already exists
        let conversation = await Conversation.findOne({
            buyerId,
            shopId,
            ...(productId && { productId }),
            ...(orderId && { orderId }),
            status: { $ne: 'CLOSED' }
        });

        if (conversation) {
            // If conversation exists, just add the message
            if (initialMessage) {
                await conversation.addMessage(
                    initialMessage.senderInfo,
                    initialMessage.content,
                    initialMessage.messageType || 'TEXT',
                    initialMessage.attachments || []
                );
            }
        } else {
            // Create new conversation
            conversation = new Conversation({
                buyerId,
                shopId,
                conversationType: conversationType || 'GENERAL',
                productId,
                orderId,
                subject: subject || 'Trao đổi về đơn hàng/sản phẩm'
            });

            await conversation.save();

            // Add initial message if provided
            if (initialMessage) {
                await conversation.addMessage(
                    initialMessage.senderInfo,
                    initialMessage.content,
                    initialMessage.messageType || 'TEXT',
                    initialMessage.attachments || []
                );
            }
        }

        // Populate before returning
        await conversation.populate('buyerId', 'fullName avatar email');
        await conversation.populate('shopId', 'shopName avatar');

        res.status(201).json({
            success: true,
            data: conversation,
            message: conversation.isNew ? 'Conversation created' : 'Message added to existing conversation'
        });
    } catch (error) {
        console.error('Error creating conversation:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create conversation',
            error: error.message
        });
    }
};

// Send message
const sendMessage = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { senderInfo, content, messageType, attachments, replyTo } = req.body;

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        const message = await conversation.addMessage(
            senderInfo,
            content,
            messageType || 'TEXT',
            attachments || [],
            replyTo || null
        );

        res.json({
            success: true,
            data: message,
            message: 'Message sent successfully'
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message',
            error: error.message
        });
    }
};

// Mark messages as read
const markAsRead = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { readerType } = req.body;

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        await conversation.markAsRead(readerType);

        res.json({
            success: true,
            message: 'Messages marked as read'
        });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark messages as read',
            error: error.message
        });
    }
};

// Archive conversation
const archiveConversation = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { archiverType } = req.body;

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        await conversation.archive(archiverType);

        res.json({
            success: true,
            message: 'Conversation archived'
        });
    } catch (error) {
        console.error('Error archiving conversation:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to archive conversation',
            error: error.message
        });
    }
};

// Close conversation
const closeConversation = async (req, res) => {
    try {
        const { conversationId } = req.params;

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        await conversation.close();

        res.json({
            success: true,
            message: 'Conversation closed'
        });
    } catch (error) {
        console.error('Error closing conversation:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to close conversation',
            error: error.message
        });
    }
};

// Get or create conversation with shop
const getOrCreateConversation = async (req, res) => {
    try {
        const { buyerId, shopId, productId } = req.body;

        // Find existing conversation between buyer and shop (regardless of product)
        let conversation = await Conversation.findOne({
            buyerId,
            shopId,
            status: { $ne: 'CLOSED' }
        })
            .populate('buyerId', 'fullName avatarUrl email')
            .populate('shopId', 'shopName avatarUrl')
            .populate('productId', 'productName images');

        if (!conversation) {
            // Create new conversation between buyer and shop
            conversation = new Conversation({
                buyerId,
                shopId,
                conversationType: 'GENERAL',
                subject: 'Trao đổi với shop'
            });

            await conversation.save();
            await conversation.populate('buyerId', 'fullName avatarUrl email');
            await conversation.populate('shopId', 'shopName avatarUrl');
        }

        res.json({
            success: true,
            data: conversation
        });
    } catch (error) {
        console.error('Error getting/creating conversation:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get/create conversation',
            error: error.message
        });
    }
};

module.exports = {
    getConversationsByBuyer,
    getConversationsByShop,
    getConversationsByUserId,
    getConversationById,
    createConversation,
    sendMessage,
    markAsRead,
    archiveConversation,
    closeConversation,
    getOrCreateConversation
};

