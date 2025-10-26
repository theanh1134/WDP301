const mongoose = require('mongoose');

const shippingProviderSchema = new mongoose.Schema({
    shipperCode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    shipperName: {
        type: String,
        required: true
    },
    contactPhone: {
        type: String,
        required: true
    },
    supportedMethods: [{
        type: String,
        enum: ['STANDARD', 'EXPRESS', 'SAME_DAY'],
        required: true
    }],
    supportedZones: [{
        type: String,
        enum: ['URBAN_HN_HCM', 'INTERPROVINCIAL', 'RURAL'],
        required: true
    }],
    ratingAverage: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    ratingCount: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    description: String,
    website: String,
    logo: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes
shippingProviderSchema.index({ shipperCode: 1 });
shippingProviderSchema.index({ isActive: 1 });
shippingProviderSchema.index({ supportedMethods: 1 });
shippingProviderSchema.index({ supportedZones: 1 });

module.exports = mongoose.model('ShippingProvider', shippingProviderSchema);
