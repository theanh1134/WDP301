const mongoose = require('mongoose');

/**
 * Withdrawal Fee Configuration Model
 * Quản lý cấu hình phí rút tiền linh hoạt
 */

const tierSchema = new mongoose.Schema({
    minAmount: {
        type: Number,
        required: true,
        min: 0
    },
    maxAmount: {
        type: Number,
        required: true,
        min: 0
    },
    fee: {
        type: Number,
        required: true,
        min: 0
    }
}, { _id: false });

const withdrawalFeeConfigSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        default: 'Default Fee Config'
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    type: {
        type: String,
        enum: ['FIXED', 'PERCENTAGE', 'TIERED'],
        required: true,
        default: 'PERCENTAGE'
    },
    // For FIXED type
    fixedAmount: {
        type: Number,
        default: 5000,
        min: 0
    },
    // For PERCENTAGE type
    percentage: {
        type: Number,
        default: 1, // 1%
        min: 0,
        max: 100
    },
    minFee: {
        type: Number,
        default: 5000,
        min: 0
    },
    maxFee: {
        type: Number,
        default: 50000,
        min: 0
    },
    // For TIERED type
    tiers: {
        type: [tierSchema],
        default: []
    },
    // VIP/Premium users exemption
    vipExemption: {
        type: Boolean,
        default: true,
        comment: 'VIP users không phải trả phí'
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
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

// Index
withdrawalFeeConfigSchema.index({ isActive: 1, effectiveFrom: -1 });

// Static method: Get active config
withdrawalFeeConfigSchema.statics.getActiveConfig = async function() {
    const now = new Date();
    
    const config = await this.findOne({
        isActive: true,
        effectiveFrom: { $lte: now },
        $or: [
            { effectiveTo: null },
            { effectiveTo: { $gte: now } }
        ]
    }).sort({ effectiveFrom: -1 });
    
    return config;
};

// Static method: Calculate fee
withdrawalFeeConfigSchema.statics.calculateFee = async function(amount, userTier = 'NORMAL') {
    const config = await this.getActiveConfig();
    
    if (!config) {
        console.warn('⚠️ No active fee config found, using default 0');
        return 0;
    }
    
    // VIP users: free withdrawal
    if (config.vipExemption && (userTier === 'VIP' || userTier === 'PLATINUM')) {
        console.log('✨ VIP user - free withdrawal');
        return 0;
    }
    
    let fee = 0;
    
    switch (config.type) {
        case 'FIXED':
            fee = config.fixedAmount;
            console.log(`💰 Fixed fee: ${fee.toLocaleString()} VND`);
            break;
            
        case 'PERCENTAGE':
            fee = amount * (config.percentage / 100);
            fee = Math.max(config.minFee, Math.min(fee, config.maxFee));
            console.log(`💰 Percentage fee (${config.percentage}%): ${fee.toLocaleString()} VND`);
            break;
            
        case 'TIERED':
            const tier = config.tiers.find(t => 
                amount >= t.minAmount && amount <= t.maxAmount
            );
            fee = tier ? tier.fee : config.minFee;
            console.log(`💰 Tiered fee: ${fee.toLocaleString()} VND`);
            break;
            
        default:
            fee = 0;
    }
    
    return Math.round(fee);
};

// Instance method: Validate tier configuration
withdrawalFeeConfigSchema.methods.validateTiers = function() {
    if (this.type !== 'TIERED') return true;
    
    if (!this.tiers || this.tiers.length === 0) {
        throw new Error('Tiered fee config must have at least one tier');
    }
    
    // Check for overlapping ranges
    for (let i = 0; i < this.tiers.length; i++) {
        for (let j = i + 1; j < this.tiers.length; j++) {
            const tier1 = this.tiers[i];
            const tier2 = this.tiers[j];
            
            if (
                (tier1.minAmount <= tier2.maxAmount && tier1.maxAmount >= tier2.minAmount) ||
                (tier2.minAmount <= tier1.maxAmount && tier2.maxAmount >= tier1.minAmount)
            ) {
                throw new Error(`Overlapping tier ranges: [${tier1.minAmount}-${tier1.maxAmount}] and [${tier2.minAmount}-${tier2.maxAmount}]`);
            }
        }
    }
    
    return true;
};

// Pre-save validation
withdrawalFeeConfigSchema.pre('save', function(next) {
    try {
        if (this.type === 'TIERED') {
            this.validateTiers();
        }
        
        if (this.type === 'PERCENTAGE') {
            if (this.minFee > this.maxFee) {
                throw new Error('minFee cannot be greater than maxFee');
            }
        }
        
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('WithdrawalFeeConfig', withdrawalFeeConfigSchema);

