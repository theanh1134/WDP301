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
    paidAt: {
        type: Date,
        default: null
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

    buyerConfirmed: {
        type: Boolean,
        default: false,
        comment: 'True when buyer confirms receipt of goods'
    },
    buyerConfirmedAt: {
        type: Date,
        default: null,
        comment: 'Timestamp when buyer confirmed receipt'
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
    },
    // Seller payment tracking
    sellerPayment: {
        isPaid: {
            type: Boolean,
            default: false,
            comment: 'True when seller has been paid for this order'
        },
        paidAt: {
            type: Date,
            default: null,
            comment: 'Timestamp when seller was paid'
        },
        transactionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SellerTransaction',
            default: null,
            comment: 'Reference to seller transaction record'
        },
        platformFee: {
            type: Number,
            default: 0,
            min: [0, 'Platform fee cannot be negative'],
            comment: 'Platform fee deducted from order amount'
        },
        platformFeeRate: {
            type: Number,
            default: 0,
            comment: 'Platform fee rate (%) applied'
        },
        netAmount: {
            type: Number,
            default: 0,
            comment: 'Net amount paid to seller (after platform fee)'
        }
    },
    // Refund/Return tracking
    hasRefundRequest: {
        type: Boolean,
        default: false,
        index: true,
        comment: 'True if there is a refund/return request for this order'
    },
    refundRequestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Return',
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
        console.error('Subtotal validation failed:', {
            provided: this.subtotal,
            calculated: calculatedSubtotal,
            difference: this.subtotal - calculatedSubtotal,
            items: this.items.map(item => ({
                name: item.productName,
                price: item.priceAtPurchase,
                quantity: item.quantity,
                total: item.priceAtPurchase * item.quantity
            }))
        });
        next(new Error(`Subtotal does not match items total. Expected: ${calculatedSubtotal}, Got: ${this.subtotal}`));
        return;
    }

    // Validate final amount
    const expectedFinal = this.subtotal + this.shippingFee + this.tipAmount;
    if (this.finalAmount !== expectedFinal) {
        console.error('Final amount validation failed:', {
            provided: this.finalAmount,
            calculated: expectedFinal,
            subtotal: this.subtotal,
            shippingFee: this.shippingFee,
            tipAmount: this.tipAmount
        });
        next(new Error(`Final amount does not match total. Expected: ${expectedFinal}, Got: ${this.finalAmount}`));
        return;
    }

    // Validate payment amount matches final amount
    if (this.paymentInfo.amount !== this.finalAmount) {
        console.error('Payment amount validation failed:', {
            paymentAmount: this.paymentInfo.amount,
            finalAmount: this.finalAmount
        });
        next(new Error(`Payment amount does not match final amount. Expected: ${this.finalAmount}, Got: ${this.paymentInfo.amount}`));
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
        this.paymentInfo.paidAt = new Date();
        this.paymentInfo.escrowReleaseAt = new Date();

        const orderAge = Math.floor((new Date() - this.createdAt) / (1000 * 60 * 60 * 24));
        console.log(`\n📦 Order marked as DELIVERED (${orderAge} days old)`);

        // Save the order first
        await this.save();

        // ✅ Auto-process seller payment if order is >= 7 days old
        if (orderAge >= 7) {
            console.log(`💰 Order is ${orderAge} days old (>= 7 days)`);
            console.log(`   Processing seller payment immediately...`);

            try {
                // Dynamic import to avoid circular dependency
                const SellerPaymentService = require('../services/sellerPaymentService');
                const result = await SellerPaymentService.processOrderPayment(this._id);

                if (result.success) {
                    console.log(`✅ Seller payment processed: ${result.data.netAmount.toLocaleString()} VND`);
                } else {
                    console.log(`⚠️  Seller payment skipped: ${result.message}`);
                }
            } catch (error) {
                console.error(`❌ Error processing seller payment:`, error.message);
            }
        } else {
            const daysRemaining = 7 - orderAge;
            console.log(`⏳ Seller payment will be processed in ${daysRemaining} more day(s)`);
        }
    } else if (newStatus === 'CANCELLED' || newStatus === 'REFUNDED') {
        this.paymentInfo.status = 'REFUNDED';
        await this.save();
    } else {
        await this.save();
    }

    return this;
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

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
