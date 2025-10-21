const mongoose = require('mongoose');

// Nested schema for buyer information
const buyerInfoSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true
    }
}, {
    _id: false
});

// Nested schema for shipping address
const shippingAddressSchema = new mongoose.Schema({
    recipientName: {
        type: String,
        required: [true, 'Recipient name is required'],
        trim: true
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        match: [/^[0-9]{10,11}$/, 'Please enter a valid phone number']
    },
    fullAddress: {
        type: String,
        required: [true, 'Full address is required'],
        trim: true
    }
}, {
    _id: false
});

// Nested schema for order items
const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product ID is required']
    },
    productName: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    thumbnailUrl: {
        type: String,
        default: ''
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be at least 1']
    },
    priceAtPurchase: {
        type: Number,
        required: [true, 'Price at purchase is required'],
        min: [0, 'Price must be non-negative']
    },
    costPriceAtPurchase: {
        type: Number,
        required: [true, 'Cost price at purchase is required'],
        min: [0, 'Cost price must be non-negative']
    }
}, {
    _id: false
});

// Nested schema for payment information
const paymentInfoSchema = new mongoose.Schema({
    method: {
        type: String,
        enum: ['COD', 'VNPay', 'Momo', 'BankTransfer'],
        required: [true, 'Payment method is required']
    },
    amount: {
        type: Number,
        required: [true, 'Payment amount is required'],
        min: [0, 'Payment amount must be non-negative']
    },
    status: {
        type: String,
        enum: ['PENDING', 'PAID', 'HELD_IN_ESCROW', 'REFUNDED', 'FAILED', 'CANCELLED'],
        required: [true, 'Payment status is required']
    },
    transactionId: {
        type: String,
        required: [true, 'Transaction ID is required'],
        unique: true
    },
    escrowReleaseAt: {
        type: Date,
        default: null
    }
}, {
    _id: false
});

const orderSchema = new mongoose.Schema({
    buyerInfo: {
        type: buyerInfoSchema,
        required: true
    },
    shippingAddress: {
        type: shippingAddressSchema,
        required: true
    },
    items: {
        type: [orderItemSchema],
        required: true,
        validate: [
            {
                validator: function (items) {
                    return items && items.length > 0;
                },
                message: 'Order must contain at least one item'
            }
        ]
    },
    paymentInfo: {
        type: paymentInfoSchema,
        required: true
    },
    subtotal: {
        type: Number,
        required: [true, 'Subtotal is required'],
        min: [0, 'Subtotal must be non-negative']
    },
    shippingFee: {
        type: Number,
        required: [true, 'Shipping fee is required'],
        min: [0, 'Shipping fee must be non-negative']
    },
    tipAmount: {
        type: Number,
        default: 0,
        min: [0, 'Tip amount must be non-negative']
    },
    finalAmount: {
        type: Number,
        required: [true, 'Final amount is required'],
        min: [0, 'Final amount must be non-negative']
    },
    status: {
        type: String,
        enum: ['PENDING', 'PROCESSING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'],
        default: 'PENDING'
    },
    cancellationReason: {
        type: String,
        default: null,
        trim: true
    },
    cancelledBy: {
        type: String,
        enum: ['BUYER', 'SELLER', 'ADMIN', null],
        default: null
    },
    cancelledAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Indexes for quick lookups
orderSchema.index({ 'buyerInfo.userId': 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'paymentInfo.transactionId': 1 }, { unique: true });

// Pre-save hook to validate amounts
orderSchema.pre('save', function (next) {
    // Calculate expected subtotal
    const calculatedSubtotal = this.items.reduce((sum, item) => {
        return sum + (item.priceAtPurchase * item.quantity);
    }, 0);

    // Validate subtotal
    if (this.subtotal !== calculatedSubtotal) {
        next(new Error('Subtotal does not match items total'));
        return;
    }

    // Validate final amount
    const expectedFinal = this.subtotal + this.shippingFee + this.tipAmount;
    if (this.finalAmount !== expectedFinal) {
        next(new Error('Final amount does not match total'));
        return;
    }

    // Validate payment amount matches final amount
    if (this.paymentInfo.amount !== this.finalAmount) {
        next(new Error('Payment amount does not match final amount'));
        return;
    }

    next();
});

// Utility methods
orderSchema.methods.updateStatus = async function (newStatus, reason = '') {
    const validTransitions = {
        PENDING: ['PROCESSING', 'CONFIRMED', 'CANCELLED'],  // ✅ Cho phép skip PROCESSING
        PROCESSING: ['CONFIRMED', 'CANCELLED'],
        CONFIRMED: ['SHIPPED', 'CANCELLED'],
        SHIPPED: ['DELIVERED', 'CANCELLED'],
        DELIVERED: ['REFUNDED'],
        CANCELLED: ['REFUNDED'],
        REFUNDED: []
    };

    if (!validTransitions[this.status].includes(newStatus)) {
        throw new Error(`Invalid status transition from ${this.status} to ${newStatus}`);
    }

    this.status = newStatus;

    // Handle payment status updates
    if (newStatus === 'DELIVERED') {
        this.paymentInfo.status = 'PAID';
        this.paymentInfo.escrowReleaseAt = new Date();
    } else if (newStatus === 'CANCELLED' || newStatus === 'REFUNDED') {
        this.paymentInfo.status = 'REFUNDED';
    }

    return this.save();
};

orderSchema.methods.calculateProfit = function () {
    return this.items.reduce((profit, item) => {
        const itemProfit = (item.priceAtPurchase - item.costPriceAtPurchase) * item.quantity;
        return profit + itemProfit;
    }, 0);
};

// Static method to get user's order history
orderSchema.statics.getUserOrders = function (userId, status = null) {
    const query = { 'buyerInfo.userId': userId };
    if (status) {
        query.status = status;
    }
    return this.find(query).sort({ createdAt: -1 });
};

module.exports = mongoose.model('Order', orderSchema);
