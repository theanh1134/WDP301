const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Seller ID is required']
    },
    shopName: {
        type: String,
        required: [true, 'Shop name is required'],
        trim: true,
        minlength: [3, 'Shop name must be at least 3 characters long'],
        maxlength: [50, 'Shop name cannot exceed 50 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    bannerUrl: {
        type: String,
        default: 'https://via.placeholder.com/1200x300?text=Shop+Banner',
        validate: {
            validator: function(v) {
                // Basic URL validation
                try {
                    new URL(v);
                    return true;
                } catch (err) {
                    return false;
                }
            },
            message: 'Invalid banner URL format'
        }
    },
    avatarUrl: {
        type: String,
        default: 'https://via.placeholder.com/150?text=Shop',
        validate: {
            validator: function(v) {
                // Basic URL validation
                try {
                    new URL(v);
                    return true;
                } catch (err) {
                    return false;
                }
            },
            message: 'Invalid avatar URL format'
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    statistics: {
        totalProducts: {
            type: Number,
            default: 0,
            min: 0
        },
        totalOrders: {
            type: Number,
            default: 0,
            min: 0
        },
        completedOrders: {
            type: Number,
            default: 0,
            min: 0
        },
        followers: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    responseTime: {
        type: String,
        default: 'trong vài giờ',
        enum: ['trong vài phút', 'trong vài giờ', 'trong vài ngày']
    },
    amount: {
        type: Number,
        default: 0,
        min: [0, 'Shop amount cannot be negative'],
        comment: 'Số tiền hiện có của cửa hàng'
    },
    lastActivityAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for quick lookups
shopSchema.index({ sellerId: 1 }, { unique: true });
shopSchema.index({ shopName: 1 });
shopSchema.index({ 'rating.average': -1 });
shopSchema.index({ isActive: 1 });

// Virtual for completion rate
shopSchema.virtual('statistics.completionRate').get(function() {
    if (this.statistics.totalOrders === 0) return 0;
    return (this.statistics.completedOrders / this.statistics.totalOrders * 100).toFixed(2);
});

// Virtual for products (to be populated)
shopSchema.virtual('products', {
    ref: 'Product',
    localField: '_id',
    foreignField: 'shopId'
});

// Virtual for recent orders (to be populated)
shopSchema.virtual('recentOrders', {
    ref: 'Order',
    localField: '_id',
    foreignField: 'shopId',
    options: { 
        limit: 5, 
        sort: { createdAt: -1 } 
    }
});

// Update rating method
shopSchema.methods.updateRating = function(newRating) {
    const oldTotal = this.rating.average * this.rating.count;
    this.rating.count += 1;
    this.rating.average = (oldTotal + newRating) / this.rating.count;
    return this.save();
};

// Update statistics method
shopSchema.methods.updateStatistics = async function(updates) {
    Object.assign(this.statistics, updates);
    this.lastActivityAt = new Date();
    return this.save();
};

// Static method to find active shops with good ratings
shopSchema.statics.findTopRatedShops = function(limit = 10) {
    return this.find({ 
        isActive: true,
        'rating.count': { $gte: 5 }  // At least 5 ratings
    })
    .sort({ 'rating.average': -1 })
    .limit(limit);
};

// Pre-save middleware
shopSchema.pre('save', function(next) {
    this.lastActivityAt = new Date();
    next();
});

// Ensure shop name uniqueness for active shops
shopSchema.pre('save', async function(next) {
    if (this.isModified('shopName')) {
        const existingShop = await this.constructor.findOne({
            _id: { $ne: this._id },
            shopName: this.shopName,
            isActive: true
        });
        
        if (existingShop) {
            next(new Error('Shop name is already in use by an active shop'));
        }
    }
    next();
});

// Toggle active status (for admin ban/unban)
shopSchema.methods.toggleActiveStatus = async function() {
    this.isActive = !this.isActive;
    this.lastActivityAt = new Date();
    await this.save();
    return this;
};


module.exports = mongoose.model('Shop', shopSchema);
