const mongoose = require('mongoose');

// Nested schema for cart items
const cartItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product ID is required']
    },
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: [true, 'Shop ID is required']
    },
    productName: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    thumbnailUrl: {
        type: String,
        required: [true, 'Thumbnail URL is required']
    },
    priceAtAdd: {
        type: Number,
        required: [true, 'Price at add time is required'],
        min: [0, 'Price must be non-negative']
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be at least 1']
    },
    isSelected: {
        type: Boolean,
        default: true // Mặc định chọn sản phẩm khi thêm vào giỏ
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
}, {
    _id: false // Disable auto _id for nested documents
});

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    sessionId: {
        type: String,
        default: null,
        sparse: true // Allow multiple null values but ensure uniqueness for non-null
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'MERGED', 'ABANDONED', 'CONVERTED'],
        default: 'ACTIVE'
    },
    items: [cartItemSchema],
    savedForLater: [cartItemSchema],
    appliedVouchers: [{
        type: String,
        trim: true
    }],
    notes: {
        type: String,
        trim: true,
        default: ''
    },
    currency: {
        type: String,
        default: 'VND',
        required: [true, 'Currency is required']
    },
    subtotal: {
        type: Number,
        required: [true, 'Subtotal is required'],
        min: [0, 'Subtotal must be non-negative'],
        default: 0
    },
    estimatedShipping: {
        type: Number,
        default: null
    },
    estimatedTotal: {
        type: Number,
        required: [true, 'Estimated total is required'],
        min: [0, 'Estimated total must be non-negative'],
        default: 0
    }
}, {
    timestamps: true
});

// Ensure either userId or sessionId is present
cartSchema.pre('save', function(next) {
    if (!this.userId && !this.sessionId) {
        next(new Error('Either userId or sessionId must be provided'));
    }
    next();
});

// Index for quick lookups
cartSchema.index({ userId: 1, status: 1 });
cartSchema.index({ sessionId: 1, status: 1 });
cartSchema.index({ updatedAt: -1 });

// Calculate totals before saving
cartSchema.pre('save', function(next) {
    // Calculate subtotal
    this.subtotal = this.items.reduce((sum, item) => {
        return sum + (item.priceAtAdd * item.quantity);
    }, 0);

    // Update estimated total
    this.estimatedTotal = this.subtotal + (this.estimatedShipping || 0);
    next();
});

// Utility methods
cartSchema.methods.addItem = function(item) {
    const existingItemIndex = this.items.findIndex(
        i => i.productId.toString() === item.productId.toString()
    );

    if (existingItemIndex > -1) {
        this.items[existingItemIndex].quantity += item.quantity;
    } else {
        this.items.push(item);
    }
    return this.save();
};

cartSchema.methods.updateItemQuantity = function(productId, quantity) {
    const item = this.items.find(i => i.productId.toString() === productId.toString());
    if (item) {
        item.quantity = quantity;
        return this.save();
    }
    return Promise.reject(new Error('Item not found in cart'));
};

cartSchema.methods.removeItem = function(productId) {
    this.items = this.items.filter(item => item.productId.toString() !== productId.toString());
    return this.save();
};

cartSchema.methods.clearCart = function() {
    this.items = [];
    this.appliedVouchers = [];
    this.estimatedShipping = null;
    return this.save();
};

cartSchema.methods.moveToSavedForLater = function(productId) {
    const itemIndex = this.items.findIndex(item => item.productId.toString() === productId.toString());
    if (itemIndex > -1) {
        const item = this.items[itemIndex];
        this.items.splice(itemIndex, 1);
        this.savedForLater.push(item);
        return this.save();
    }
    return Promise.reject(new Error('Item not found in cart'));
};

module.exports = mongoose.model('Cart', cartSchema);
