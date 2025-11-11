const mongoose = require('mongoose');

/**
 * Commission Change History
 * Lưu vết thay đổi phí hoa hồng của từng shop/seller
 */

const commissionChangeSchema = new mongoose.Schema({
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true,
        index: true
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    configId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PlatformFeeConfig',
        default: null
    },
    changedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    previousRate: {
        type: Number,
        default: null
    },
    newRate: {
        type: Number,
        required: true,
        min: [0, 'Commission rate cannot be negative'],
        max: [100, 'Commission rate cannot exceed 100%']
    },
    feeType: {
        type: String,
        enum: ['PERCENTAGE', 'FIXED', 'TIERED'],
        default: 'PERCENTAGE'
    },
    reason: {
        type: String,
        default: '',
        trim: true,
        maxlength: [300, 'Reason cannot exceed 300 characters']
    },
    note: {
        type: String,
        default: '',
        trim: true,
        maxlength: [500, 'Note cannot exceed 500 characters']
    },
    appliedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

commissionChangeSchema.index({ shopId: 1, createdAt: -1 });
commissionChangeSchema.index({ sellerId: 1, createdAt: -1 });

module.exports = mongoose.model('CommissionChange', commissionChangeSchema);





