const mongoose = require('mongoose');

// Nested schema for commission value
const commissionValueSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: [true, 'Commission type is required'],
        default: 'percentage'
    },
    rate: {
        type: Number,
        required: [true, 'Commission rate is required'],
        min: [0, 'Commission rate must be non-negative'],
        max: [100, 'Commission rate cannot exceed 100% for percentage type']
    }
}, {
    _id: false
});

const commissionSchema = new mongoose.Schema({
    feeName: {
        type: String,
        required: [true, 'Fee name is required'],
        trim: true,
        maxlength: [100, 'Fee name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    value: {
        type: commissionValueSchema,
        required: [true, 'Commission value is required']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // Optional: Apply to specific categories or shops
    scope: {
        type: String,
        enum: ['GLOBAL', 'SHOP', 'CATEGORY'],
        default: 'GLOBAL'
    },
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        default: null
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', 
        default: null
    },
    // Effective date range
    effectiveFrom: {
        type: Date,
        default: Date.now
    },
    effectiveTo: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Indexes for performance
commissionSchema.index({ isActive: 1, scope: 1 });
commissionSchema.index({ shopId: 1, isActive: 1 });
commissionSchema.index({ categoryId: 1, isActive: 1 });
commissionSchema.index({ effectiveFrom: 1, effectiveTo: 1 });

// Pre-save validation
commissionSchema.pre('save', function(next) {
    // Validate scope-specific requirements
    if (this.scope === 'SHOP' && !this.shopId) {
        return next(new Error('Shop ID is required for SHOP scope'));
    }
    if (this.scope === 'CATEGORY' && !this.categoryId) {
        return next(new Error('Category ID is required for CATEGORY scope'));
    }
    if (this.scope === 'GLOBAL') {
        this.shopId = null;
        this.categoryId = null;
    }

    // Validate effective dates
    if (this.effectiveTo && this.effectiveFrom >= this.effectiveTo) {
        return next(new Error('Effective from date must be before effective to date'));
    }

    next();
});

// Method to calculate commission amount
commissionSchema.methods.calculateCommission = function(orderAmount) {
    if (!this.isActive) {
        throw new Error('Commission is not active');
    }

    const now = new Date();
    if (this.effectiveFrom > now) {
        throw new Error('Commission is not yet effective');
    }
    if (this.effectiveTo && this.effectiveTo < now) {
        throw new Error('Commission has expired');
    }

    let commissionAmount = 0;
    
    if (this.value.type === 'percentage') {
        commissionAmount = (orderAmount * this.value.rate) / 100;
    } else if (this.value.type === 'fixed') {
        commissionAmount = this.value.rate;
    }

    return {
        commissionAmount: Math.round(commissionAmount),
        rate: this.value.rate,
        type: this.value.type,
        orderAmount: orderAmount,
        feeName: this.feeName
    };
};

// Static method to get active commission for order
commissionSchema.statics.getCommissionForOrder = async function(orderData) {
    const { shopId, categoryId, totalAmount } = orderData;
    
    // Priority: Shop-specific > Category-specific > Global
    let commission = null;
    
    // 1. Try shop-specific commission first
    if (shopId) {
        commission = await this.findOne({
            scope: 'SHOP',
            shopId: shopId,
            isActive: true,
            effectiveFrom: { $lte: new Date() },
            $or: [
                { effectiveTo: null },
                { effectiveTo: { $gte: new Date() } }
            ]
        }).sort({ updatedAt: -1 });
    }
    
    // 2. Try category-specific commission
    if (!commission && categoryId) {
        commission = await this.findOne({
            scope: 'CATEGORY', 
            categoryId: categoryId,
            isActive: true,
            effectiveFrom: { $lte: new Date() },
            $or: [
                { effectiveTo: null },
                { effectiveTo: { $gte: new Date() } }
            ]
        }).sort({ updatedAt: -1 });
    }
    
    // 3. Fall back to global commission
    if (!commission) {
        commission = await this.findOne({
            scope: 'GLOBAL',
            isActive: true,
            effectiveFrom: { $lte: new Date() },
            $or: [
                { effectiveTo: null },
                { effectiveTo: { $gte: new Date() } }
            ]
        }).sort({ updatedAt: -1 });
    }
    
    if (commission) {
        return commission.calculateCommission(totalAmount);
    }
    
    return null;
};

// Virtual for formatted rate display
commissionSchema.virtual('formattedRate').get(function() {
    if (this.value.type === 'percentage') {
        return `${this.value.rate}%`;
    } else {
        return `${this.value.rate.toLocaleString()} VND`;
    }
});

// Set virtuals to be included in JSON output
commissionSchema.set('toJSON', { virtuals: true });
commissionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Commission', commissionSchema);
