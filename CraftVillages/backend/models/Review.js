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
        required: [true, 'Reviewer name is required'],
        trim: true
    }
}, {
    _id: false
});

// Nested schema for review images
const reviewImageSchema = new mongoose.Schema({
    url: {
        type: String,
        required: [true, 'Image URL is required'],
        trim: true
    }
}, {
    _id: false
});

// Nested schema for seller reply
const sellerReplySchema = new mongoose.Schema({
    replyId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        auto: true
    },
    content: {
        type: String,
        required: [true, 'Reply content is required'],
        trim: true,
        maxlength: [1000, 'Reply cannot exceed 1000 characters']
    },
    repliedAt: {
        type: Date,
        default: Date.now
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
    reviewer: {
        type: reviewerSchema,
        required: true
    },
    title: {
        type: String,
        required: [true, 'Review title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    content: {
        type: String,
        required: [true, 'Review content is required'],
        trim: true,
        maxlength: [2000, 'Review content cannot exceed 2000 characters']
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5']
    },
    images: {
        type: [reviewImageSchema],
        default: [],
        validate: [
            {
                validator: function(images) {
                    return images.length <= 10;
                },
                message: 'Cannot upload more than 10 images'
            }
        ]
    },
    verifiedPurchase: {
        type: Boolean,
        default: false
    },
    helpfulCount: {
        type: Number,
        default: 0,
        min: [0, 'Helpful count cannot be negative']
    },
    status: {
        type: String,
        enum: {
            values: ['PENDING', 'VISIBLE', 'HIDDEN', 'REPORTED'],
            message: '{VALUE} is not a valid review status'
        },
        default: 'VISIBLE'
    },
    sellerReply: {
        type: sellerReplySchema,
        default: null
    }
}, {
    timestamps: true
});

// Indexes for quick lookups
reviewSchema.index({ productId: 1, status: 1, createdAt: -1 });
reviewSchema.index({ shopId: 1, status: 1 });
reviewSchema.index({ 'reviewer.userId': 1, status: 1 });
reviewSchema.index({ rating: 1 });

// Virtual for checking if review can be edited
reviewSchema.virtual('isEditable').get(function() {
    const editWindow = 72; // hours
    const now = new Date();
    const hoursElapsed = (now - this.createdAt) / (1000 * 60 * 60);
    return hoursElapsed <= editWindow;
});

// Ensure virtuals are included in JSON
reviewSchema.set('toJSON', { virtuals: true });
reviewSchema.set('toObject', { virtuals: true });

// Static method to get product rating stats
reviewSchema.statics.getProductRatingStats = async function(productId) {
    return this.aggregate([
        { $match: { 
            productId: new mongoose.Types.ObjectId(productId),
            status: 'VISIBLE'
        }},
        { $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 },
            ratingCounts: {
                $push: '$rating'
            }
        }},
        { $project: {
            _id: 0,
            averageRating: { $round: ['$averageRating', 1] },
            totalReviews: 1,
            ratingDistribution: {
                5: { $size: { $filter: { input: '$ratingCounts', as: 'rating', cond: { $eq: ['$$rating', 5] } } } },
                4: { $size: { $filter: { input: '$ratingCounts', as: 'rating', cond: { $eq: ['$$rating', 4] } } } },
                3: { $size: { $filter: { input: '$ratingCounts', as: 'rating', cond: { $eq: ['$$rating', 3] } } } },
                2: { $size: { $filter: { input: '$ratingCounts', as: 'rating', cond: { $eq: ['$$rating', 2] } } } },
                1: { $size: { $filter: { input: '$ratingCounts', as: 'rating', cond: { $eq: ['$$rating', 1] } } } }
            }
        }}
    ]);
};

// Instance method to mark review as helpful
reviewSchema.methods.markHelpful = function() {
    this.helpfulCount += 1;
    return this.save();
};

// Instance method to add seller reply
reviewSchema.methods.addSellerReply = function(content) {
    if (this.sellerReply) {
        throw new Error('Review already has a seller reply');
    }
    
    this.sellerReply = {
        content,
        repliedAt: new Date()
    };
    
    return this.save();
};

// Instance method to report review
reviewSchema.methods.report = function(reason) {
    this.status = 'REPORTED';
    this.reportReason = reason;
    return this.save();
};

// Static method to get shop review summary
reviewSchema.statics.getShopReviewStats = async function(shopId) {
    return this.aggregate([
        { $match: { 
            shopId: new mongoose.Types.ObjectId(shopId),
            status: 'VISIBLE'
        }},
        { $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 },
            verifiedReviews: {
                $sum: { $cond: ['$verifiedPurchase', 1, 0] }
            }
        }},
        { $project: {
            _id: 0,
            averageRating: { $round: ['$averageRating', 1] },
            totalReviews: 1,
            verifiedReviews: 1,
            verifiedPercentage: {
                $round: [
                    { $multiply: [
                        { $divide: ['$verifiedReviews', '$totalReviews'] },
                        100
                    ]},
                    1
                ]
            }
        }}
    ]);
};

module.exports = mongoose.model('Review', reviewSchema);
