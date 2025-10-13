const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
    methodCode: {
        type: String,
        required: [true, 'Method code is required'],
        unique: true,
        uppercase: true,
        enum: {
            values: ['VNPAY', 'MOMO', 'BANK_TRANSFER', 'COD'],
            message: '{VALUE} is not a supported payment method code'
        }
    },
    displayName: {
        type: String,
        required: [true, 'Display name is required'],
        trim: true,
        maxlength: [50, 'Display name cannot exceed 50 characters']
    },
    type: {
        type: String,
        required: [true, 'Payment type is required'],
        enum: {
            values: ['ONLINE_GATEWAY', 'ONLINE_WALLET', 'BANKING', 'CASH'],
            message: '{VALUE} is not a supported payment type'
        }
    },
    isOnline: {
        type: Boolean,
        required: [true, 'Online status is required']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [200, 'Description cannot exceed 200 characters']
    },
    feePolicyRef: {
        type: String,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastUpdatedAt: {
        type: Date,
        default: Date.now
    },
    config: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: () => ({}),
        select: false // Hide config by default for security
    }
}, {
    timestamps: true
});

// Indexes for quick lookups
paymentMethodSchema.index({ methodCode: 1 }, { unique: true });
paymentMethodSchema.index({ isActive: 1, type: 1 });

// Auto-update lastUpdatedAt on save
paymentMethodSchema.pre('save', function(next) {
    this.lastUpdatedAt = new Date();
    next();
});

// Utility methods

// Get all active payment methods
paymentMethodSchema.statics.getActivePaymentMethods = function() {
    return this.find({ isActive: true }).sort({ displayName: 1 });
};

// Get payment methods by type
paymentMethodSchema.statics.getPaymentMethodsByType = function(type) {
    return this.find({ type, isActive: true }).sort({ displayName: 1 });
};

// Get online payment methods only
paymentMethodSchema.statics.getOnlinePaymentMethods = function() {
    return this.find({ isOnline: true, isActive: true }).sort({ displayName: 1 });
};

// Update payment method configuration
paymentMethodSchema.methods.updateConfig = async function(configUpdates) {
    const currentConfig = this.config || new Map();
    
    // Merge new config with existing
    Object.entries(configUpdates).forEach(([key, value]) => {
        if (value === null) {
            currentConfig.delete(key);
        } else {
            currentConfig.set(key, value);
        }
    });
    
    this.config = currentConfig;
    this.lastUpdatedAt = new Date();
    
    return this.save();
};

// Validate configuration (to be implemented based on payment type)
paymentMethodSchema.methods.validateConfig = function() {
    const requiredConfig = {
        VNPAY: ['merchantId', 'secureHash'],
        MOMO: ['partnerId', 'partnerKey'],
        BANK_TRANSFER: ['accountNumber', 'bankName'],
        COD: []
    };

    const required = requiredConfig[this.methodCode] || [];
    const missing = required.filter(key => !this.config.has(key));

    if (missing.length > 0) {
        throw new Error(`Missing required configuration for ${this.methodCode}: ${missing.join(', ')}`);
    }

    return true;
};

// Toggle active status
paymentMethodSchema.methods.toggleActive = function() {
    this.isActive = !this.isActive;
    this.lastUpdatedAt = new Date();
    return this.save();
};

// Virtual for determining if method requires additional processing
paymentMethodSchema.virtual('requiresProcessing').get(function() {
    return ['BANK_TRANSFER', 'COD'].includes(this.methodCode);
});

// Ensure virtuals are included when converting to JSON
paymentMethodSchema.set('toJSON', { virtuals: true });
paymentMethodSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);
