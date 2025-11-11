const mongoose = require('mongoose');

/**
 * Seller Transaction Model
 * Lưu lịch sử giao dịch của seller (nhận tiền từ đơn hàng, trừ tiền khi refund, rút tiền, etc.)
 */

const sellerTransactionSchema = new mongoose.Schema({
    transactionCode: {
        type: String,
        required: [true, 'Transaction code is required'],
        unique: true,
        uppercase: true,
        index: true
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Seller ID is required'],
        index: true
    },
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        default: null,
        index: true
    },
    transactionType: {
        type: String,
        enum: [
            'ORDER_PAYMENT',        // Nhận tiền từ đơn hàng hoàn tất
            'REFUND_DEDUCTION',     // Trừ tiền khi có refund
            'WITHDRAWAL',           // Rút tiền
            'ADJUSTMENT',           // Điều chỉnh số dư (admin)
            'COMMISSION_REFUND',    // Hoàn lại phí sàn (nếu có)
            'PENALTY',              // Phạt (vi phạm chính sách)
            'BONUS'                 // Thưởng
        ],
        required: [true, 'Transaction type is required'],
        index: true
    },
    // Reference to related entities
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        default: null,
        index: true
    },
    returnId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Return',
        default: null,
        index: true
    },
    withdrawalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Withdrawal',
        default: null,
        index: true
    },
    // Amount details
    amounts: {
        grossAmount: {
            type: Number,
            required: [true, 'Gross amount is required'],
            comment: 'Tổng tiền đơn hàng (trước khi trừ phí)'
        },
        platformFee: {
            type: Number,
            default: 0,
            min: [0, 'Platform fee cannot be negative'],
            comment: 'Phí sàn'
        },
        platformFeeRate: {
            type: Number,
            default: 0,
            comment: 'Tỷ lệ phí sàn (%)'
        },
        netAmount: {
            type: Number,
            required: [true, 'Net amount is required'],
            comment: 'Số tiền thực tế seller nhận được (sau khi trừ phí)'
        },
        currency: {
            type: String,
            default: 'VND'
        }
    },
    // Platform fee configuration used
    platformFeeConfig: {
        configId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PlatformFeeConfig',
            default: null
        },
        configName: {
            type: String,
            default: null
        },
        feeType: {
            type: String,
            enum: ['PERCENTAGE', 'FIXED', 'TIERED', null],
            default: null
        }
    },
    // Balance snapshot
    balanceSnapshot: {
        beforeTransaction: {
            type: Number,
            required: [true, 'Balance before transaction is required'],
            min: [0, 'Balance cannot be negative']
        },
        afterTransaction: {
            type: Number,
            required: [true, 'Balance after transaction is required'],
            min: [0, 'Balance cannot be negative']
        }
    },
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED', 'REVERSED'],
        default: 'COMPLETED',
        index: true
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },
    // Processing info
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
        comment: 'Admin/System user who processed this transaction'
    },
    processedAt: {
        type: Date,
        default: Date.now
    },
    // Metadata
    metadata: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: () => ({})
    }
}, {
    timestamps: true
});

// Indexes
sellerTransactionSchema.index({ sellerId: 1, createdAt: -1 });
sellerTransactionSchema.index({ transactionType: 1, status: 1 });
sellerTransactionSchema.index({ orderId: 1 });
sellerTransactionSchema.index({ createdAt: -1 });

// Pre-save hook: Generate transaction code
sellerTransactionSchema.pre('save', async function(next) {
    if (!this.transactionCode) {
        const prefix = 'STX'; // Seller Transaction
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        this.transactionCode = `${prefix}${timestamp}${random}`;
    }
    next();
});

// Pre-save validation
sellerTransactionSchema.pre('save', function(next) {
    // Validate balance calculation
    const { netAmount } = this.amounts;
    const { beforeTransaction, afterTransaction } = this.balanceSnapshot;
    
    let expectedAfterBalance;
    
    // For credit transactions (adding money)
    if (['ORDER_PAYMENT', 'COMMISSION_REFUND', 'BONUS', 'ADJUSTMENT'].includes(this.transactionType)) {
        if (netAmount > 0) {
            expectedAfterBalance = beforeTransaction + netAmount;
        } else {
            expectedAfterBalance = beforeTransaction;
        }
    }
    // For debit transactions (subtracting money)
    else if (['REFUND_DEDUCTION', 'WITHDRAWAL', 'PENALTY'].includes(this.transactionType)) {
        expectedAfterBalance = beforeTransaction - Math.abs(netAmount);
    }
    
    // Allow small rounding differences (1 VND)
    if (expectedAfterBalance !== undefined && Math.abs(afterTransaction - expectedAfterBalance) > 1) {
        console.warn(`⚠️  Balance mismatch in transaction ${this.transactionCode}:`, {
            type: this.transactionType,
            before: beforeTransaction,
            netAmount: netAmount,
            expected: expectedAfterBalance,
            actual: afterTransaction,
            difference: afterTransaction - expectedAfterBalance
        });
    }
    
    next();
});

// Instance Methods

/**
 * Get formatted transaction details
 */
sellerTransactionSchema.methods.getFormattedDetails = function() {
    return {
        transactionCode: this.transactionCode,
        type: this.transactionType,
        grossAmount: `${this.amounts.grossAmount.toLocaleString()} VND`,
        platformFee: `${this.amounts.platformFee.toLocaleString()} VND`,
        netAmount: `${this.amounts.netAmount.toLocaleString()} VND`,
        balanceBefore: `${this.balanceSnapshot.beforeTransaction.toLocaleString()} VND`,
        balanceAfter: `${this.balanceSnapshot.afterTransaction.toLocaleString()} VND`,
        status: this.status,
        createdAt: this.createdAt
    };
};

/**
 * Check if transaction can be reversed
 */
sellerTransactionSchema.methods.canBeReversed = function() {
    return this.status === 'COMPLETED' && 
           ['ORDER_PAYMENT', 'BONUS', 'ADJUSTMENT'].includes(this.transactionType);
};

// Static Methods

/**
 * Create transaction for order payment
 */
sellerTransactionSchema.statics.createOrderPayment = async function(options) {
    const { sellerId, shopId, orderId, grossAmount, platformFee, platformFeeRate, platformFeeConfig, currentBalance } = options;

    const netAmount = grossAmount - platformFee;

    // Generate transaction code
    const prefix = 'STX'; // Seller Transaction
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const transactionCode = `${prefix}${timestamp}${random}`;

    const transaction = new this({
        transactionCode,
        sellerId,
        shopId,
        orderId,
        transactionType: 'ORDER_PAYMENT',
        amounts: {
            grossAmount,
            platformFee,
            platformFeeRate,
            netAmount
        },
        platformFeeConfig: platformFeeConfig ? {
            configId: platformFeeConfig._id || platformFeeConfig.configId,
            configName: platformFeeConfig.name || platformFeeConfig.configName,
            feeType: platformFeeConfig.feeType
        } : undefined,
        balanceSnapshot: {
            beforeTransaction: currentBalance,
            afterTransaction: currentBalance + netAmount
        },
        status: 'COMPLETED',
        description: `Nhận tiền từ đơn hàng #${orderId}`,
        processedAt: new Date()
    });

    return transaction.save();
};

/**
 * Create transaction for refund deduction
 */
sellerTransactionSchema.statics.createRefundDeduction = async function(options) {
    const { sellerId, shopId, orderId, returnId, refundAmount, currentBalance } = options;
    
    const transaction = new this({
        sellerId,
        shopId,
        orderId,
        returnId,
        transactionType: 'REFUND_DEDUCTION',
        amounts: {
            grossAmount: -refundAmount,
            platformFee: 0,
            platformFeeRate: 0,
            netAmount: -refundAmount
        },
        balanceSnapshot: {
            beforeTransaction: currentBalance,
            afterTransaction: currentBalance - refundAmount
        },
        status: 'COMPLETED',
        description: `Trừ tiền do hoàn hàng #${returnId}`,
        processedAt: new Date()
    });
    
    return transaction.save();
};

/**
 * Get seller's transaction history
 */
sellerTransactionSchema.statics.getSellerHistory = function(sellerId, options = {}) {
    const { 
        transactionType = null,
        status = null,
        limit = 50, 
        skip = 0, 
        sortBy = 'createdAt', 
        sortOrder = -1 
    } = options;

    const query = { sellerId };
    if (transactionType) query.transactionType = transactionType;
    if (status) query.status = status;

    const sortObj = {};
    sortObj[sortBy] = sortOrder;

    return this.find(query)
        .sort(sortObj)
        .limit(limit)
        .skip(skip)
        .populate('sellerId', 'fullName email')
        .populate('shopId', 'shopName')
        .populate('orderId', 'orderNumber finalAmount')
        .populate('returnId', 'rmaCode');
};

// Virtuals
sellerTransactionSchema.virtual('formattedNetAmount').get(function() {
    return `${this.amounts.netAmount.toLocaleString()} VND`;
});

sellerTransactionSchema.set('toJSON', { virtuals: true });
sellerTransactionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('SellerTransaction', sellerTransactionSchema);

