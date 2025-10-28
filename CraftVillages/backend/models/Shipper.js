const mongoose = require('mongoose');

const shipperSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    licenseNumber: {
        type: String,
        required: true,
        unique: true
    },
    vehicleType: {
        type: String,
        enum: ['MOTORBIKE', 'CAR', 'BIKE', 'TRUCK'],
        required: true
    },
    vehicleNumber: {
        type: String,
        required: true,
        unique: true
    },
    maxWeight: {
        type: Number,
        default: 50
    },
    maxVolume: {
        type: Number,
        default: 100
    },
    serviceAreas: [{
        type: String
    }],
    workingHours: {
        start: {
            type: String,
            default: '06:00'
        },
        end: {
            type: String,
            default: '22:00'
        }
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    currentLocation: {
        latitude: {
            type: Number,
            default: null
        },
        longitude: {
            type: Number,
            default: null
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    },
    rating: {
        average: {
            type: Number,
            default: 5,
            min: 0,
            max: 5
        },
        totalReviews: {
            type: Number,
            default: 0
        }
    },
    totalDeliveries: {
        type: Number,
        default: 0
    },
    totalEarnings: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'],
        default: 'PENDING'
    },
    bankInfo: {
        accountName: String,
        accountNumber: String,
        bankName: String,
        accountType: String
    },
    documents: {
        licenseImage: String,
        vehicleRegistration: String,
        insuranceDocument: String
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

// Index để tìm kiếm nhanh
shipperSchema.index({ userId: 1 });
shipperSchema.index({ vehicleNumber: 1 });
shipperSchema.index({ isOnline: 1 });
shipperSchema.index({ status: 1 });

module.exports = mongoose.model('Shipper', shipperSchema);
