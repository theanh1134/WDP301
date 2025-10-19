const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    // Participants
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true,
        index: true
    },

    // Conversation metadata
    subject: {
        type: String,
        required: true,
        trim: true,
        default: 'Trao đổi về đơn hàng/sản phẩm'
    },
    conversationType: {
        type: String,
        enum: ['ORDER_INQUIRY', 'PRODUCT_QUESTION', 'COMPLAINT', 'RETURN_REFUND', 'GENERAL'],
        default: 'GENERAL'
    },

    // References (optional - depends on conversation type)
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        default: null,
        index: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        default: null,
        index: true
    },

    // Messages array
    messages: [{
        messageId: {
            type: mongoose.Schema.Types.ObjectId,
            default: () => new mongoose.Types.ObjectId()
        },
        sender: {
            type: {
                type: String,
                enum: ['USER', 'SHOP_STAFF', 'SYSTEM'],
                required: true
            },
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                default: null
            },
            shopId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Shop',
                default: null
            },
            // Cache sender info to avoid extra queries
            name: {
                type: String,
                default: null
            },
            avatar: {
                type: String,
                default: null
            }
        },
        messageType: {
            type: String,
            enum: ['TEXT', 'IMAGE', 'FILE', 'SYSTEM_NOTIFICATION'],
            default: 'TEXT'
        },
        content: {
            type: String,
            required: function() {
                // Content is required only if there are no attachments
                return !this.attachments || this.attachments.length === 0;
            },
            trim: true,
            default: ''
        },
        attachments: [{
            fileUrl: String,
            fileName: String,
            fileSize: Number,
            fileType: String
        }],
        replyTo: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        },
        deliveredAt: {
            type: Date,
            default: Date.now
        },
        readAt: {
            type: Date,
            default: null
        },
        isEdited: {
            type: Boolean,
            default: false
        },
        editedAt: {
            type: Date,
            default: null
        },
        deletedAt: {
            type: Date,
            default: null
        }
    }],

    // Conversation status
    status: {
        type: String,
        enum: ['OPEN', 'CLOSED', 'ARCHIVED'],
        default: 'OPEN',
        index: true
    },
    priority: {
        type: String,
        enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
        default: 'NORMAL'
    },
    tags: [{
        type: String,
        trim: true
    }],

    // Unread tracking
    unreadCount: {
        buyer: {
            type: Number,
            default: 0
        },
        shop: {
            type: Number,
            default: 0
        }
    },

    // Last message info (for sorting and preview)
    lastMessageAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    lastMessagePreview: {
        type: String,
        default: null,
        maxlength: 100
    },
    lastMessageSender: {
        type: String,
        enum: ['USER', 'SHOP_STAFF', 'SYSTEM'],
        default: null
    },

    // Archive flags
    isArchivedByBuyer: {
        type: Boolean,
        default: false
    },
    isArchivedByShop: {
        type: Boolean,
        default: false
    },

    // Notification tracking
    notificationSent: {
        type: Boolean,
        default: false
    },
    emailSent: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes for performance
conversationSchema.index({ buyerId: 1, status: 1, lastMessageAt: -1 });
conversationSchema.index({ shopId: 1, status: 1, lastMessageAt: -1 });
conversationSchema.index({ orderId: 1 });
conversationSchema.index({ productId: 1 });

// Unique index: One active conversation per buyer-shop pair
// Note: We'll handle CLOSED conversations in application logic
conversationSchema.index({ buyerId: 1, shopId: 1, status: 1 }, { unique: true });

// Virtual for active messages (not deleted)
conversationSchema.virtual('activeMessages').get(function() {
    return this.messages.filter(msg => !msg.deletedAt);
});

// Method: Add new message
conversationSchema.methods.addMessage = async function(senderInfo, content, messageType = 'TEXT', attachments = [], replyTo = null) {
    // If content is empty but has attachments, set a default message
    const messageContent = content || (attachments && attachments.length > 0 ? '[Hình ảnh]' : '');

    const newMessage = {
        sender: senderInfo,
        messageType,
        content: messageContent,
        attachments,
        replyTo,
        deliveredAt: new Date()
    };

    this.messages.push(newMessage);
    this.lastMessageAt = new Date();
    this.lastMessagePreview = messageContent.substring(0, 100);
    this.lastMessageSender = senderInfo.type;

    // Update unread count
    if (senderInfo.type === 'USER') {
        this.unreadCount.shop += 1;
    } else if (senderInfo.type === 'SHOP_STAFF') {
        this.unreadCount.buyer += 1;
    }

    await this.save();
    return this.messages[this.messages.length - 1];
};

// Method: Mark messages as read
conversationSchema.methods.markAsRead = async function(readerType) {
    const now = new Date();
    let hasUnread = false;

    this.messages.forEach(msg => {
        if (!msg.readAt) {
            // Buyer reads shop messages
            if (readerType === 'BUYER' && msg.sender.type === 'SHOP_STAFF') {
                msg.readAt = now;
                hasUnread = true;
            }
            // Shop reads buyer messages
            else if (readerType === 'SHOP' && msg.sender.type === 'USER') {
                msg.readAt = now;
                hasUnread = true;
            }
        }
    });

    if (hasUnread) {
        if (readerType === 'BUYER') {
            this.unreadCount.buyer = 0;
        } else if (readerType === 'SHOP') {
            this.unreadCount.shop = 0;
        }
        await this.save();
    }

    return hasUnread;
};

// Method: Archive conversation
conversationSchema.methods.archive = async function(archiverType) {
    if (archiverType === 'BUYER') {
        this.isArchivedByBuyer = true;
    } else if (archiverType === 'SHOP') {
        this.isArchivedByShop = true;
    }
    await this.save();
};

// Method: Close conversation
conversationSchema.methods.close = async function() {
    this.status = 'CLOSED';
    await this.save();
};

// Static: Get conversations by buyer
conversationSchema.statics.getByBuyer = function(buyerId, includeArchived = false) {
    const query = { buyerId };
    if (!includeArchived) {
        query.isArchivedByBuyer = false;
    }
    return this.find(query)
        .populate('shopId', 'shopName avatarUrl')
        .populate('orderId', '_id status')
        .populate('productId', 'productName images')
        .sort({ lastMessageAt: -1 });
};

// Static: Get conversations by shop
conversationSchema.statics.getByShop = function(shopId, includeArchived = false) {
    const query = { shopId };
    if (!includeArchived) {
        query.isArchivedByShop = false;
    }
    return this.find(query)
        .populate('buyerId', 'fullName avatarUrl email')
        .populate('shopId', 'shopName avatarUrl')
        .populate('orderId', '_id status')
        .populate('productId', 'productName images')
        .sort({ lastMessageAt: -1 });
};

conversationSchema.statics.getByUserId = function(userId, includeArchived = false) {
    // Tìm tất cả conversations mà userId tham gia (là buyer hoặc shop)
    const query = {
        $or: [
            { buyerId: userId },
            { shopId: userId }
        ]
    };

    if (!includeArchived) {
        query.$and = [
            { $or: query.$or },
            {
                $or: [
                    { isArchivedByBuyer: false },
                    { isArchivedByShop: false }
                ]
            }
        ];
        delete query.$or;
    }

    return this.find(query)
        .populate('buyerId', 'fullName avatarUrl email')
        .populate('shopId', 'shopName avatarUrl')
        .populate('orderId', '_id status')
        .populate('productId', 'productName images')
        .sort({ lastMessageAt: -1 });
};

// Static: Get conversation by order
conversationSchema.statics.getByOrder = function(orderId) {
    return this.findOne({ orderId })
        .populate('buyerId', 'fullName avatar email')
        .populate('shopId', 'shopName avatar');
};

module.exports = mongoose.model('Conversation', conversationSchema);

