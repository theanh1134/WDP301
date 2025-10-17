const mongoose = require('mongoose');

// Nested schema for reviewer information
const reviewerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true
    }
}, {
    _id: false
});

const reviewSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product ID is required']
    },
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: [true, 'Shop ID is required']
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: [true, 'Order ID is required']
    },
    reviewer: {
        type: reviewerSchema,
        required: true
    },
    title: {
        type: String,
        required: [true, 'Review title is required'],
        trim: true,
        maxLength: [100, 'Title cannot exceed 100 characters']
    },
    content: {
        type: String,
        required: [true, 'Review content is required'],
        trim: true,
        maxLength: [500, 'Content cannot exceed 500 characters']
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5']
    },
    images: [{
        type: String, // URL to uploaded image
        default: []
    }],
    verifiedPurchase: {
        type: Boolean,
        default: true // Since review comes from order
    },
    helpfulCount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['PENDING', 'VISIBLE', 'HIDDEN', 'DELETED'],
        default: 'VISIBLE'
    },
    editCount: {
        type: Number,
        default: 0,
        max: 1 // Chỉ được chỉnh sửa 1 lần
    },
    canEdit: {
        type: Boolean,
        default: true
    },
    canDelete: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes for quick lookups
reviewSchema.index({ productId: 1, status: 1, createdAt: -1 });
reviewSchema.index({ shopId: 1, status: 1, createdAt: -1 });
reviewSchema.index({ 'reviewer.userId': 1, createdAt: -1 });
reviewSchema.index({ orderId: 1 }, { unique: true }); // One review per order

// Static method to get product reviews
reviewSchema.statics.getProductReviews = function (productId, status = 'VISIBLE') {
    return this.find({ productId, status }).sort({ createdAt: -1 });
};

// Static method to get shop reviews
reviewSchema.statics.getShopReviews = function (shopId, status = 'VISIBLE') {
    return this.find({ shopId, status }).sort({ createdAt: -1 });
};

// Static method to calculate average rating
reviewSchema.statics.getAverageRating = function (productId) {
    return this.aggregate([
        { $match: { productId: mongoose.Types.ObjectId(productId), status: 'VISIBLE' } },
        { $group: { _id: null, averageRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } }
    ]);
};

// Instance method to increment helpful count
reviewSchema.methods.incrementHelpful = async function () {
    this.helpfulCount += 1;
    return this.save();
};

// Pre-save middleware to update canEdit and canDelete
reviewSchema.pre('save', function (next) {
    // Kiểm tra thời gian tạo để xác định có thể xóa không (3 ngày)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    this.canDelete = this.createdAt > threeDaysAgo;

    // Kiểm tra số lần chỉnh sửa
    this.canEdit = this.editCount < 1;

    next();
});

module.exports = mongoose.model('Review', reviewSchema);

