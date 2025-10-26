const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    shipperId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shipper',
        required: true
    },
    status: {
        type: String,
        enum: ['ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'RETURNED'],
        default: 'ASSIGNED'
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    assignedAt: {
        type: Date,
        default: Date.now
    },
    pickupLocation: {
        address: String,
        latitude: Number,
        longitude: Number,
        timestamp: Date
    },
    deliveryLocation: {
        address: String,
        latitude: Number,
        longitude: Number,
        timestamp: Date
    },
    currentLocation: {
        latitude: Number,
        longitude: Number,
        updatedAt: {
            type: Date,
            default: Date.now
        }
    },
    estimatedPickupTime: {
        type: Date
    },
    actualPickupTime: {
        type: Date
    },
    estimatedDeliveryTime: {
        type: Date
    },
    actualDeliveryTime: {
        type: Date
    },
    deliveryProof: {
        customerSignature: String,
        photos: [String],
        notes: String
    },
    shippingFee: {
        baseFee: Number,
        distanceFee: Number,
        weightFee: Number,
        bonus: {
            type: Number,
            default: 0
        },
        total: Number
    },
    distance: {
        type: Number, // in km
        default: 0
    },
    weight: {
        type: Number, // in kg
        default: 0
    },
    attempts: {
        type: Number,
        default: 1
    },
    failureReason: String,
    trackingHistory: [{
        status: String,
        location: {
            latitude: Number,
            longitude: Number,
            address: String
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        notes: String
    }],
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
shipmentSchema.index({ orderId: 1 });
shipmentSchema.index({ shipperId: 1 });
shipmentSchema.index({ status: 1 });
shipmentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Shipment', shipmentSchema);
