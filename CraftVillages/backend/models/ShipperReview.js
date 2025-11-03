const mongoose = require('mongoose');

const shipperReviewSchema = new mongoose.Schema({
    shipperId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shipper',
        required: true,
        index: true
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    shipmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shipment',
        required: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    customerName: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        trim: true,
        maxlength: 500
    },
    aspects: {
        delivery: {
            type: Number,
            min: 1,
            max: 5,
            default: null
        },
        politeness: {
            type: Number,
            min: 1,
            max: 5,
            default: null
        },
        communication: {
            type: Number,
            min: 1,
            max: 5,
            default: null
        }
    },
    methodCode: {
        type: String,
        enum: ['STANDARD', 'EXPRESS', 'SAME_DAY'],
        default: 'STANDARD'
    },
    zoneCode: {
        type: String,
        enum: ['URBAN_HN_HCM', 'INTERPROVINCIAL', 'RURAL'],
        required: false
    },
    helpfulCount: {
        type: Number,
        default: 0,
        min: 0
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'HIDDEN', 'DELETED'],
        default: 'ACTIVE'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes
shipperReviewSchema.index({ shipperId: 1, createdAt: -1 });
shipperReviewSchema.index({ orderId: 1 });
shipperReviewSchema.index({ shipmentId: 1 });
shipperReviewSchema.index({ customerId: 1 });

module.exports = mongoose.model('ShipperReview', shipperReviewSchema);
