const mongoose = require('mongoose');

const shipperSettingsSchema = new mongoose.Schema({
    shipperId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shipper',
        required: true,
        unique: true
    },
    notifications: {
        newOrder: {
            type: Boolean,
            default: true
        },
        deliveryReminder: {
            type: Boolean,
            default: true
        },
        paymentReceived: {
            type: Boolean,
            default: true
        },
        ratingReceived: {
            type: Boolean,
            default: true
        }
    },
    workingDays: [{
        type: String,
        enum: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
    }],
    maxOrdersPerDay: {
        type: Number,
        default: 10,
        min: 1,
        max: 100
    },
    preferredZones: [{
        type: String
    }],
    autoAcceptOrders: {
        type: Boolean,
        default: false
    },
    language: {
        type: String,
        enum: ['vi', 'en'],
        default: 'vi'
    },
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
shipperSettingsSchema.index({ shipperId: 1 });

module.exports = mongoose.model('ShipperSettings', shipperSettingsSchema);
