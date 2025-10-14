const mongoose = require('mongoose');

// Nested schema for fee tiers
const feeTierSchema = new mongoose.Schema({
    minAmount: {
        type: Number,
        required: [true, 'Minimum amount is required'],
        min: [0, 'Minimum amount must be non-negative']
    },
    maxAmount: {
        type: Number,
        default: null,
        validate: {
            validator: function(v) {
                return v === null || v > this.minAmount;
            },
            message: 'Maximum amount must be greater than minimum amount'
        }
    },
    ratePercent: {
        type: Number,
        required: [true, 'Rate percentage is required'],
        min: [0, 'Rate percentage must be non-negative'],
        max: [100, 'Rate percentage cannot exceed 100']
    }
}, {
    _id: false
});

// Nested schema for fixed fee
const fixedFeeSchema = new mongoose.Schema({
    currency: {
        type: String,
        required: [true, 'Currency is required'],
        default: 'VND'
    },
    amount: {
        type: Number,
        required: [true, 'Fixed fee amount is required'],
        min: [0, 'Fixed fee amount must be non-negative'],
        default: 0
    }
}, {
    _id: false
});

const feeSchema = new mongoose.Schema({
    scope: {
        type: String,
        enum: ['GLOBAL_DEFAULT', 'SHOP', 'CATEGORY'],
        required: [true, 'Fee scope is required']
    },
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        default: null
    },
    shopHint: {
        type: String,
        trim: true
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    name: {
        type: String,
        required: [true, 'Fee name is required'],
        trim: true,
        maxlength: [100, 'Fee name cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    tiers: {
        type: [feeTierSchema],
        required: [true, 'At least one fee tier is required'],
        validate: {
            validator: function(tiers) {
                if (tiers.length === 0) return false;
                
                // Check for overlapping ranges
                for (let i = 0; i < tiers.length - 1; i++) {
                    if (tiers[i].maxAmount === null) return false;
                    if (tiers[i].maxAmount !== tiers[i + 1].minAmount) return false;
                }
                return true;
            },
            message: 'Fee tiers must be continuous and non-overlapping'
        }
    },
    fixedFee: {
        type: fixedFeeSchema,
        required: true,
        default: () => ({})
    },
    effectiveFrom: {
        type: Date,
        required: [true, 'Effective from date is required']
    },
    effectiveTo: {
        type: Date,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Ensure scope-specific validation
feeSchema.pre('save', function(next) {
    if (this.scope === 'SHOP' && !this.shopId && !this.shopHint) {
        next(new Error('Either shopId or shopHint is required for SHOP scope'));
    }
    if (this.scope === 'CATEGORY' && !this.categoryId) {
        next(new Error('CategoryId is required for CATEGORY scope'));
    }
    if (this.scope === 'GLOBAL_DEFAULT') {
        this.shopId = null;
        this.categoryId = null;
    }
    next();
});

// Indexes for quick lookups
feeSchema.index({ scope: 1, isActive: 1 });
feeSchema.index({ shopId: 1, isActive: 1 });
feeSchema.index({ categoryId: 1, isActive: 1 });
feeSchema.index({ effectiveFrom: 1, effectiveTo: 1 });

// Utility method to calculate fee for a given amount
feeSchema.methods.calculateFee = function(amount) {
    if (!this.isActive) {
        throw new Error('Cannot calculate fee: Fee structure is not active');
    }

    const now = new Date();
    if (this.effectiveFrom > now || (this.effectiveTo && this.effectiveTo < now)) {
        throw new Error('Cannot calculate fee: Fee structure is not effective at current time');
    }

    let applicableTier = this.tiers.find(tier => 
        amount >= tier.minAmount && 
        (tier.maxAmount === null || amount < tier.maxAmount)
    );

    if (!applicableTier) {
        throw new Error('No applicable fee tier found for the given amount');
    }

    const percentageFee = (amount * applicableTier.ratePercent) / 100;
    const totalFee = percentageFee + this.fixedFee.amount;

    return {
        baseFee: percentageFee,
        fixedFee: this.fixedFee.amount,
        totalFee: totalFee,
        appliedRate: applicableTier.ratePercent,
        currency: this.fixedFee.currency
    };
};

module.exports = mongoose.model('Fee', feeSchema);
