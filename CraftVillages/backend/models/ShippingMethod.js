const mongoose = require('mongoose');

const shippingMethodSchema = new mongoose.Schema({
    methodCode: {
        type: String,
        required: [true, 'Method code is required'],
        unique: true,
        enum: {
            values: ['STANDARD', 'EXPRESS', 'SAME_DAY'],
            message: '{VALUE} is not a valid shipping method code'
        }
    },
    methodName: {
        type: String,
        required: [true, 'Method name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    slaHoursMin: {
        type: Number,
        required: [true, 'Minimum SLA hours is required'],
        min: [0, 'Minimum SLA hours must be non-negative'],
        validate: {
            validator: function(v) {
                return v <= this.slaHoursMax;
            },
            message: 'Minimum SLA hours must be less than or equal to maximum SLA hours'
        }
    },
    slaHoursMax: {
        type: Number,
        required: [true, 'Maximum SLA hours is required'],
        min: [0, 'Maximum SLA hours must be non-negative']
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
shippingMethodSchema.index({ methodCode: 1 }, { unique: true });
shippingMethodSchema.index({ isActive: 1 });

// Static method to get all active shipping methods
shippingMethodSchema.statics.getActiveMethods = function() {
    return this.find({ isActive: true }).sort('slaHoursMin');
};

// Instance method to calculate estimated delivery date range
shippingMethodSchema.methods.getEstimatedDeliveryRange = function(fromDate = new Date()) {
    const minDate = new Date(fromDate);
    minDate.setHours(minDate.getHours() + this.slaHoursMin);
    
    const maxDate = new Date(fromDate);
    maxDate.setHours(maxDate.getHours() + this.slaHoursMax);
    
    return {
        earliestDelivery: minDate,
        latestDelivery: maxDate
    };
};

// Pre-save middleware to update lastUpdatedAt
shippingMethodSchema.pre('save', function(next) {
    this.lastUpdatedAt = new Date();
    next();
});

// Format SLA display for human readable output
shippingMethodSchema.methods.formatSLA = function() {
    const minDays = Math.floor(this.slaHoursMin / 24);
    const maxDays = Math.floor(this.slaHoursMax / 24);
    
    if (minDays === maxDays) {
        return `${minDays} ngày`;
    }
    return `${minDays}–${maxDays} ngày`;
};

module.exports = mongoose.model('ShippingMethod', shippingMethodSchema);
