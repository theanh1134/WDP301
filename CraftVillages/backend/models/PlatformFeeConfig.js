const mongoose = require('mongoose');

/**
 * Platform Fee Configuration Model
 * Quản lý phí sàn (platform commission/fee) cho các giao dịch
 */

const platformFeeConfigSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Fee configuration name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    feeType: {
        type: String,
        enum: ['PERCENTAGE', 'FIXED', 'TIERED'],
        required: [true, 'Fee type is required'],
        default: 'PERCENTAGE'
    },
    // For PERCENTAGE type
    percentageRate: {
        type: Number,
        min: [0, 'Percentage rate cannot be negative'],
        max: [100, 'Percentage rate cannot exceed 100%'],
        default: null,
        validate: {
            validator: function(value) {
                if (this.feeType === 'PERCENTAGE') {
                    return value !== null && value !== undefined;
                }
                return true;
            },
            message: 'Percentage rate is required for PERCENTAGE fee type'
        }
    },
    // For FIXED type
    fixedAmount: {
        type: Number,
        min: [0, 'Fixed amount cannot be negative'],
        default: null,
        validate: {
            validator: function(value) {
                if (this.feeType === 'FIXED') {
                    return value !== null && value !== undefined;
                }
                return true;
            },
            message: 'Fixed amount is required for FIXED fee type'
        }
    },
    // For TIERED type (phí theo bậc)
    tiers: [{
        minAmount: {
            type: Number,
            required: true,
            min: [0, 'Min amount cannot be negative']
        },
        maxAmount: {
            type: Number,
            default: null // null = unlimited
        },
        percentageRate: {
            type: Number,
            min: [0, 'Percentage rate cannot be negative'],
            max: [100, 'Percentage rate cannot exceed 100%']
        },
        fixedAmount: {
            type: Number,
            min: [0, 'Fixed amount cannot be negative']
        }
    }],
    // Áp dụng cho danh mục sản phẩm cụ thể (nếu null = áp dụng chung)
    applicableCategories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    // Áp dụng cho shop cụ thể (nếu null = áp dụng chung)
    applicableShops: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop'
    }],
    // Minimum fee (nếu tính theo % mà quá thấp)
    minimumFee: {
        type: Number,
        default: 0,
        min: [0, 'Minimum fee cannot be negative']
    },
    // Maximum fee (nếu tính theo % mà quá cao)
    maximumFee: {
        type: Number,
        default: null,
        min: [0, 'Maximum fee cannot be negative']
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    priority: {
        type: Number,
        default: 0,
        comment: 'Higher priority configs are applied first'
    },
    effectiveFrom: {
        type: Date,
        default: Date.now,
        index: true
    },
    effectiveTo: {
        type: Date,
        default: null,
        index: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, {
    timestamps: true
});

// Indexes
platformFeeConfigSchema.index({ isActive: 1, priority: -1 });
platformFeeConfigSchema.index({ effectiveFrom: 1, effectiveTo: 1 });
platformFeeConfigSchema.index({ applicableCategories: 1 });
platformFeeConfigSchema.index({ applicableShops: 1 });

// Pre-save validation
platformFeeConfigSchema.pre('save', function(next) {
    // Validate tiers for TIERED type
    if (this.feeType === 'TIERED') {
        if (!this.tiers || this.tiers.length === 0) {
            return next(new Error('Tiers are required for TIERED fee type'));
        }
        
        // Validate tier ranges don't overlap
        for (let i = 0; i < this.tiers.length; i++) {
            const tier = this.tiers[i];
            if (tier.maxAmount !== null && tier.minAmount >= tier.maxAmount) {
                return next(new Error(`Invalid tier range: minAmount must be less than maxAmount`));
            }
        }
    }
    
    // Validate effective dates
    if (this.effectiveTo && this.effectiveFrom >= this.effectiveTo) {
        return next(new Error('effectiveFrom must be before effectiveTo'));
    }
    
    next();
});

// Instance Methods

/**
 * Calculate platform fee for a given order amount
 * @param {Number} orderAmount - Total order amount
 * @returns {Object} { feeAmount, netAmount, feeRate, feeType }
 */
platformFeeConfigSchema.methods.calculateFee = function(orderAmount) {
    if (!orderAmount || orderAmount <= 0) {
        return {
            feeAmount: 0,
            netAmount: orderAmount || 0,
            feeRate: 0,
            feeType: this.feeType
        };
    }

    let feeAmount = 0;
    let feeRate = 0;

    switch (this.feeType) {
        case 'PERCENTAGE':
            feeRate = this.percentageRate;
            feeAmount = (orderAmount * this.percentageRate) / 100;
            break;

        case 'FIXED':
            feeAmount = this.fixedAmount;
            feeRate = (this.fixedAmount / orderAmount) * 100;
            break;

        case 'TIERED':
            // Find applicable tier
            const tier = this.tiers.find(t => {
                const aboveMin = orderAmount >= t.minAmount;
                const belowMax = t.maxAmount === null || orderAmount < t.maxAmount;
                return aboveMin && belowMax;
            });

            if (tier) {
                if (tier.percentageRate !== undefined && tier.percentageRate !== null) {
                    feeRate = tier.percentageRate;
                    feeAmount = (orderAmount * tier.percentageRate) / 100;
                } else if (tier.fixedAmount !== undefined && tier.fixedAmount !== null) {
                    feeAmount = tier.fixedAmount;
                    feeRate = (tier.fixedAmount / orderAmount) * 100;
                }
            }
            break;
    }

    // Apply minimum and maximum fee constraints
    if (this.minimumFee && feeAmount < this.minimumFee) {
        feeAmount = this.minimumFee;
    }
    if (this.maximumFee && feeAmount > this.maximumFee) {
        feeAmount = this.maximumFee;
    }

    const netAmount = orderAmount - feeAmount;

    return {
        feeAmount: Math.round(feeAmount), // Round to nearest VND
        netAmount: Math.round(netAmount),
        feeRate: parseFloat(feeRate.toFixed(2)),
        feeType: this.feeType,
        configId: this._id,
        configName: this.name
    };
};

/**
 * Check if this config is currently active
 */
platformFeeConfigSchema.methods.isCurrentlyActive = function() {
    if (!this.isActive) return false;
    
    const now = new Date();
    const afterStart = this.effectiveFrom <= now;
    const beforeEnd = !this.effectiveTo || this.effectiveTo > now;
    
    return afterStart && beforeEnd;
};

// Static Methods

/**
 * Get applicable fee config for an order
 * @param {Object} options - { shopId, categoryIds, orderAmount }
 * @returns {PlatformFeeConfig|null}
 */
platformFeeConfigSchema.statics.getApplicableConfig = async function(options = {}) {
    const { shopId, categoryIds = [], orderAmount } = options;
    const now = new Date();

    // Build query
    const query = {
        isActive: true,
        effectiveFrom: { $lte: now },
        $or: [
            { effectiveTo: null },
            { effectiveTo: { $gt: now } }
        ]
    };

    // Find all potentially applicable configs
    const configs = await this.find(query).sort({ priority: -1, createdAt: -1 });

    // Filter by applicability
    for (const config of configs) {
        // Check shop-specific config
        if (config.applicableShops && config.applicableShops.length > 0) {
            if (shopId && config.applicableShops.some(id => id.toString() === shopId.toString())) {
                return config;
            }
            continue; // Skip if shop-specific but doesn't match
        }

        // Check category-specific config
        if (config.applicableCategories && config.applicableCategories.length > 0) {
            if (categoryIds && categoryIds.some(catId => 
                config.applicableCategories.some(id => id.toString() === catId.toString())
            )) {
                return config;
            }
            continue; // Skip if category-specific but doesn't match
        }

        // General config (no shop or category restrictions)
        return config;
    }

    return null; // No applicable config found
};

/**
 * Create default platform fee configuration
 */
platformFeeConfigSchema.statics.createDefault = async function() {
    const existingDefault = await this.findOne({ name: 'Default Platform Fee' });
    if (existingDefault) {
        return existingDefault;
    }

    const defaultConfig = new this({
        name: 'Default Platform Fee',
        description: 'Phí sàn mặc định cho tất cả giao dịch',
        feeType: 'PERCENTAGE',
        percentageRate: 5, // 5% default
        minimumFee: 1000, // Minimum 1,000 VND
        isActive: true,
        priority: 0
    });

    await defaultConfig.save();
    console.log('✅ Created default platform fee configuration: 5%');
    return defaultConfig;
};

// Virtuals
platformFeeConfigSchema.virtual('formattedRate').get(function() {
    if (this.feeType === 'PERCENTAGE') {
        return `${this.percentageRate}%`;
    } else if (this.feeType === 'FIXED') {
        return `${this.fixedAmount.toLocaleString()} VND`;
    } else {
        return 'Tiered';
    }
});

platformFeeConfigSchema.set('toJSON', { virtuals: true });
platformFeeConfigSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('PlatformFeeConfig', platformFeeConfigSchema);

