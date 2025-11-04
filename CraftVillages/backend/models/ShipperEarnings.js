const mongoose = require('mongoose');

const shipperEarningsSchema = new mongoose.Schema({
    shipperId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shipper',
        required: true
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    shipmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shipment'
    },
    date: {
        type: Date,
        default: Date.now
    },
    earnings: {
        baseFee: {
            type: Number,
            default: 0
        },
        distanceFee: {
            type: Number,
            default: 0
        },
        weightFee: {
            type: Number,
            default: 0
        },
        bonus: {
            type: Number,
            default: 0
        },
        deductions: {
            type: Number,
            default: 0
        },
        total: {
            type: Number,
            default: 0
        }
    },
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'PAID'],
        default: 'PENDING'
    },
    paymentMethod: {
        type: String,
        enum: ['BANK_TRANSFER', 'WALLET', 'CASH'],
        default: 'BANK_TRANSFER'
    },
    paymentDate: {
        type: Date,
        default: null
    },
    transactionId: String,
    notes: String,
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
shipperEarningsSchema.index({ shipperId: 1 });
shipperEarningsSchema.index({ date: -1 });
shipperEarningsSchema.index({ status: 1 });
shipperEarningsSchema.index({ shipperId: 1, date: -1 });

module.exports = mongoose.model('ShipperEarnings', shipperEarningsSchema);
