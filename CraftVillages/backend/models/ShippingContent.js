const mongoose = require('mongoose');

// Nested schema for monetary amounts
const moneySchema = new mongoose.Schema({
    currency: {
        type: String,
        required: [true, 'Currency is required'],
        default: 'VND'
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0, 'Amount must be non-negative']
    }
}, {
    _id: false
});

// Nested schema for weight-based surcharges
const weightBracketSchema = new mongoose.Schema({
    maxKg: {
        type: Number,
        default: null,
        validate: {
            validator: function(v) {
                return v === null || v > 0;
            },
            message: 'Maximum weight must be positive or null for unlimited'
        }
    },
    surcharge: {
        type: Number,
        required: [true, 'Surcharge amount is required'],
        min: [0, 'Surcharge must be non-negative']
    }
}, {
    _id: false
});

// Nested schema for COD fee structure
const codFeeSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: {
            values: ['fixed', 'percentage'],
            message: '{VALUE} is not a valid COD fee type'
        },
        required: [true, 'COD fee type is required']
    },
    rate: {
        type: Number,
        required: [true, 'COD fee rate is required'],
        min: [0, 'Rate must be non-negative']
    },
    minAmount: {
        type: Number,
        required: [true, 'Minimum COD fee amount is required'],
        min: [0, 'Minimum amount must be non-negative']
    }
}, {
    _id: false
});

const shippingContentSchema = new mongoose.Schema({
    zoneCode: {
        type: String,
        required: [true, 'Zone code is required'],
        unique: true,
        uppercase: true
    },
    zoneName: {
        type: String,
        required: [true, 'Zone name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    methodCode: {
        type: String,
        required: [true, 'Method code is required'],
        enum: {
            values: ['STANDARD', 'EXPRESS', 'SAME_DAY'],
            message: '{VALUE} is not a valid shipping method'
        }
    },
    baseRate: {
        type: moneySchema,
        required: true
    },
    weightBrackets: {
        type: [weightBracketSchema],
        required: [true, 'Weight brackets are required'],
        validate: [
            {
                validator: function(brackets) {
                    if (brackets.length === 0) return false;
                    
                    // Check for ascending order of maxKg
                    for (let i = 0; i < brackets.length - 1; i++) {
                        if (brackets[i].maxKg === null) return false;
                        if (brackets[i + 1].maxKg !== null && 
                            brackets[i].maxKg >= brackets[i + 1].maxKg) {
                            return false;
                        }
                    }
                    
                    // Last bracket should have null maxKg (unlimited)
                    return brackets[brackets.length - 1].maxKg === null;
                },
                message: 'Weight brackets must be in ascending order and end with unlimited bracket'
            }
        ]
    },
    codFee: {
        type: codFeeSchema,
        required: true
    },
    freeShippingThreshold: {
        type: Number,
        default: null,
        min: [0, 'Free shipping threshold must be non-negative']
    },
    handlingSurcharge: {
        type: Number,
        default: 0,
        min: [0, 'Handling surcharge must be non-negative']
    },
    notes: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastUpdatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for quick lookups
shippingContentSchema.index({ zoneCode: 1 }, { unique: true });
shippingContentSchema.index({ methodCode: 1, isActive: 1 });

// Calculate shipping fee
shippingContentSchema.methods.calculateShippingFee = function(weightKg, orderValue = 0) {
    // Check free shipping threshold
    if (this.freeShippingThreshold !== null && orderValue >= this.freeShippingThreshold) {
        return 0;
    }

    // Find applicable weight bracket
    const bracket = this.weightBrackets.find(b => 
        b.maxKg === null || weightKg <= b.maxKg
    );

    if (!bracket) {
        throw new Error('No applicable weight bracket found');
    }

    // Calculate total fee
    const totalFee = this.baseRate.amount + bracket.surcharge + this.handlingSurcharge;
    
    return totalFee;
};

// Calculate COD fee
shippingContentSchema.methods.calculateCodFee = function(codAmount) {
    if (this.codFee.type === 'percentage') {
        const fee = codAmount * (this.codFee.rate / 100);
        return Math.max(fee, this.codFee.minAmount);
    }
    return this.codFee.rate;
};

// Static method to find applicable shipping content
shippingContentSchema.statics.findForZoneAndMethod = function(zoneCode, methodCode) {
    return this.findOne({
        zoneCode,
        methodCode,
        isActive: true
    });
};

// Static method to get all active shipping methods for a zone
shippingContentSchema.statics.getActiveMethodsForZone = function(zoneCode) {
    return this.find({
        zoneCode,
        isActive: true
    }).sort('baseRate.amount');
};

// Pre-save middleware to update lastUpdatedAt
shippingContentSchema.pre('save', function(next) {
    this.lastUpdatedAt = new Date();
    next();
});

module.exports = mongoose.model('ShippingContent', shippingContentSchema);
