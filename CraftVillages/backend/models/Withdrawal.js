const mongoose = require('mongoose');

// Nested schema for bank information
const bankInfoSchema = new mongoose.Schema({
    bankName: {
        type: String,
        required: [true, 'Bank name is required'],
        trim: true,
        maxlength: [100, 'Bank name cannot exceed 100 characters']
    },
    accountNumber: {
        type: String,
        required: [true, 'Account number is required'],
        trim: true,
        match: [/^[0-9]{6,20}$/, 'Account number must be 6-20 digits'],
        maxlength: [20, 'Account number cannot exceed 20 characters']
    },
    accountHolderName: {
        type: String,
        required: [true, 'Account holder name is required'],
        trim: true,
        maxlength: [100, 'Account holder name cannot exceed 100 characters']
    },
    branchName: {
        type: String,
        trim: true,
        maxlength: [100, 'Branch name cannot exceed 100 characters'],
        default: ''
    }
}, {
    _id: false
});

const withdrawalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        index: true
    },
    withdrawalCode: {
        type: String,
        required: [true, 'Withdrawal code is required'],
        unique: true,
        uppercase: true
    },
    amount: {
        type: Number,
        required: [true, 'Withdrawal amount is required'],
        min: [1000, 'Minimum withdrawal amount is 1,000 VND'],
        max: [50000000, 'Maximum withdrawal amount is 50,000,000 VND per transaction']
    },
    bankInfo: {
        type: bankInfoSchema,
        required: [true, 'Bank information is required']
    },
    status: {
        type: String,
        enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'SUCCESS'],
        default: 'SUCCESS',
        index: true
    },
    requestedAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    processedAt: {
        type: Date,
        default: null
    },
    completedAt: {
        type: Date,
        default: null
    },
    // Balance before and after withdrawal
    balanceSnapshot: {
        beforeWithdrawal: {
            type: Number,
            required: [true, 'Balance before withdrawal is required'],
            min: [0, 'Balance cannot be negative']
        },
        afterWithdrawal: {
            type: Number,
            required: [true, 'Balance after withdrawal is required'],
            min: [0, 'Balance cannot be negative']
        }
    },
    // Processing information
    processingInfo: {
        processedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        transactionReference: {
            type: String,
            trim: true,
            default: null
        },
        notes: {
            type: String,
            trim: true,
            maxlength: [500, 'Notes cannot exceed 500 characters'],
            default: ''
        },
        failureReason: {
            type: String,
            trim: true,
            maxlength: [300, 'Failure reason cannot exceed 300 characters'],
            default: null
        }
    },
    // Fee information (if applicable)
    feeInfo: {
        withdrawalFee: {
            type: Number,
            default: 0,
            min: [0, 'Withdrawal fee cannot be negative']
        },
        netAmount: {
            type: Number,
            required: function() {
                return this.feeInfo && this.feeInfo.withdrawalFee > 0;
            },
            min: [0, 'Net amount cannot be negative']
        }
    }
}, {
    timestamps: true
});

// Indexes for performance
withdrawalSchema.index({ userId: 1, status: 1, requestedAt: -1 });
withdrawalSchema.index({ withdrawalCode: 1 }, { unique: true });
withdrawalSchema.index({ status: 1, requestedAt: -1 });

// Pre-validate middleware to generate withdrawal code (chạy TRƯỚC validation)
withdrawalSchema.pre('validate', function(next) {
    if (!this.withdrawalCode) {
        // Generate withdrawal code: WD + YYYYMMDD + HHMMSS + Random3Digits
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
        const randomStr = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        this.withdrawalCode = `WD${dateStr}${timeStr}${randomStr}`;
    }
    next();
});

// Pre-save validation
withdrawalSchema.pre('save', function(next) {
    // Validate balance calculation (amount + fee should be deducted from balance)
    if (this.balanceSnapshot) {
        const withdrawalFee = (this.feeInfo && this.feeInfo.withdrawalFee) ? this.feeInfo.withdrawalFee : 0;
        const totalDeducted = this.amount + withdrawalFee;
        const expectedAfterBalance = this.balanceSnapshot.beforeWithdrawal - totalDeducted;
        
        console.log('💰 Balance validation check:', {
            beforeBalance: this.balanceSnapshot.beforeWithdrawal,
            amount: this.amount,
            withdrawalFee: withdrawalFee,
            totalDeducted: totalDeducted,
            expectedAfterBalance: expectedAfterBalance,
            actualAfterBalance: this.balanceSnapshot.afterWithdrawal
        });

        if (Math.abs(this.balanceSnapshot.afterWithdrawal - expectedAfterBalance) > 0.01) {
            return next(new Error(`Balance calculation is incorrect. Expected: ${expectedAfterBalance}, Got: ${this.balanceSnapshot.afterWithdrawal}`));
        }
    }

    // Validate net amount calculation if fee is applied
    if (this.feeInfo && this.feeInfo.withdrawalFee > 0) {
        const expectedNetAmount = this.amount - this.feeInfo.withdrawalFee;
        if (!this.feeInfo.netAmount || Math.abs(this.feeInfo.netAmount - expectedNetAmount) > 0.01) {
            return next(new Error('Net amount calculation is incorrect'));
        }
    }

    next();
});

// Instance method: Process withdrawal (change status and update timestamps)
withdrawalSchema.methods.updateStatus = async function(newStatus, processingInfo = {}) {
    const validTransitions = {
        PENDING: ['PROCESSING', 'CANCELLED', 'SUCCESS'],
        PROCESSING: ['COMPLETED', 'FAILED', 'CANCELLED', 'SUCCESS'],
        COMPLETED: [],
        FAILED: ['PROCESSING'], // Allow retry
        CANCELLED: [],
        SUCCESS: [] // SUCCESS is final status
    };

    if (!validTransitions[this.status].includes(newStatus)) {
        throw new Error(`Invalid status transition from ${this.status} to ${newStatus}`);
    }

    this.status = newStatus;
    
    // Update timestamps based on status
    const now = new Date();
    if (newStatus === 'PROCESSING' && !this.processedAt) {
        this.processedAt = now;
    }
    if (newStatus === 'COMPLETED' || newStatus === 'SUCCESS') {
        this.completedAt = now;
        if (!this.processedAt) this.processedAt = now;
    }

    // Update processing info
    if (processingInfo.processedBy) this.processingInfo.processedBy = processingInfo.processedBy;
    if (processingInfo.transactionReference) this.processingInfo.transactionReference = processingInfo.transactionReference;
    if (processingInfo.notes) this.processingInfo.notes = processingInfo.notes;
    if (processingInfo.failureReason) this.processingInfo.failureReason = processingInfo.failureReason;

    await this.save();
    return this;
};

// Instance method: Calculate total deducted amount (amount + fee)
withdrawalSchema.methods.getTotalDeductedAmount = function() {
    return this.amount + (this.feeInfo?.withdrawalFee || 0);
};

// Instance method: Get formatted bank info
withdrawalSchema.methods.getFormattedBankInfo = function() {
    return {
        display: `${this.bankInfo.bankName} - ${this.bankInfo.accountNumber}`,
        accountHolder: this.bankInfo.accountHolderName,
        bankName: this.bankInfo.bankName,
        accountNumber: this.bankInfo.accountNumber,
        branchName: this.bankInfo.branchName || 'N/A'
    };
};

// Static method: Create withdrawal request
withdrawalSchema.statics.createWithdrawalRequest = async function(userId, amount, bankInfo, withdrawalFee = 0) {
    const User = require('./User');
    
    try {
        // Get user and validate balance
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const currentBalance = user.getBalance();
        const totalDeduction = amount + withdrawalFee;
        
        if (currentBalance < totalDeduction) {
            throw new Error(`Insufficient balance. Current: ${currentBalance.toLocaleString()} VND, Required: ${totalDeduction.toLocaleString()} VND`);
        }

        // Create withdrawal record
        const withdrawal = new this({
            userId,
            amount,
            bankInfo,
            balanceSnapshot: {
                beforeWithdrawal: currentBalance,
                afterWithdrawal: currentBalance - totalDeduction
            },
            feeInfo: withdrawalFee > 0 ? {
                withdrawalFee,
                netAmount: amount - withdrawalFee
            } : undefined
        });

        // Save withdrawal record first
        await withdrawal.save();

        // Deduct from user balance
        await user.subtractBalance(totalDeduction, `Withdrawal request ${withdrawal.withdrawalCode}`);

        console.log(`✅ Withdrawal request created: ${withdrawal.withdrawalCode} - ${amount.toLocaleString()} VND`);
        
        return withdrawal;
    } catch (error) {
        console.error('❌ Error creating withdrawal request:', error);
        throw error;
    }
};

// Static method: Get user's withdrawal history
withdrawalSchema.statics.getUserWithdrawalHistory = function(userId, options = {}) {
    const { 
        status = null, 
        limit = 20, 
        skip = 0, 
        sortBy = 'requestedAt', 
        sortOrder = -1 
    } = options;

    const query = { userId };
    if (status) query.status = status;

    const sortObj = {};
    sortObj[sortBy] = sortOrder;

    return this.find(query)
        .sort(sortObj)
        .limit(limit)
        .skip(skip)
        .populate('userId', 'fullName email')
        .populate('processingInfo.processedBy', 'fullName email');
};

// Virtual for formatted amount display
withdrawalSchema.virtual('formattedAmount').get(function() {
    return `${this.amount.toLocaleString()} VND`;
});

// Virtual for processing duration
withdrawalSchema.virtual('processingDuration').get(function() {
    if (this.completedAt && this.requestedAt) {
        const durationMs = this.completedAt - this.requestedAt;
        const durationHours = Math.round(durationMs / (1000 * 60 * 60));
        return `${durationHours} hours`;
    }
    return null;
});

// Set virtuals to be included in JSON output
withdrawalSchema.set('toJSON', { virtuals: true });
withdrawalSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
