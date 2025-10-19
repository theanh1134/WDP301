const mongoose = require('mongoose');

const productImageSchema = new mongoose.Schema({
    url: {
        type: String,
        required: [true, 'Image URL is required'],
        trim: true
    },
    isThumbnail: {
        type: Boolean,
        default: false
    }
}, {
    _id: false
});

const moderationSchema = new mongoose.Schema({
    status: {
        type: String,
        enum: {
            values: ['PENDING', 'ACTIVE', 'REJECTED', 'SUSPENDED'],
            message: '{VALUE} is not a valid moderation status'
        },
        default: 'PENDING'
    },
    notes: {
        type: String,
        trim: true,
        default: ''
    },
    reviewedAt: {
        type: Date
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    _id: false
});

const inventoryBatchSchema = new mongoose.Schema({
    batchId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Batch ID is required'],
        auto: true
    },
    quantityReceived: {
        type: Number,
        required: [true, 'Quantity received is required'],
        min: [0, 'Quantity received must be non-negative']
    },
    quantityRemaining: {
        type: Number,
        required: [true, 'Quantity remaining is required'],
        min: [0, 'Quantity remaining must be non-negative'],
        validate: {
            validator: function(v) {
                return v <= this.quantityReceived;
            },
            message: 'Remaining quantity cannot exceed received quantity'
        }
    },
    costPrice: {
        type: Number,
        required: [true, 'Cost price is required'],
        min: [0, 'Cost price must be non-negative']
    },
    sellingPrice: {
        type: Number,
        required: false, // Optional - will use product's sellingPrice if not set
        min: [0, 'Selling price must be non-negative']
    },
    receivedDate: {
        type: Date,
        required: [true, 'Received date is required'],
        default: Date.now
    }
});

const productSchema = new mongoose.Schema({
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: [true, 'Shop ID is required']
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category ID is required']
    },
    productName: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: [200, 'Product name cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        trim: true,
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    sellingPrice: {
        type: Number,
        required: [true, 'Selling price is required'],
        min: [0, 'Selling price must be non-negative']
    },
    images: {
        type: [productImageSchema],
        validate: [
            {
                validator: function(images) {
                    return images.length > 0;
                },
                message: 'Product must have at least one image'
            },
            {
                validator: function(images) {
                    return images.filter(img => img.isThumbnail).length === 1;
                },
                message: 'Product must have exactly one thumbnail image'
            }
        ]
    },
    moderation: {
        type: moderationSchema,
        required: true,
        default: () => ({})
    },
    inventoryBatches: {
        type: [inventoryBatchSchema],
        default: []
    }
}, {
    timestamps: true
});

productSchema.index({ shopId: 1, 'moderation.status': 1 });
productSchema.index({ categoryId: 1, 'moderation.status': 1 });
productSchema.index({ productName: 'text', description: 'text' });

productSchema.virtual('totalQuantityAvailable').get(function() {
    if (!this.inventoryBatches || !Array.isArray(this.inventoryBatches)) return 0;
    return this.inventoryBatches.reduce((total, batch) => total + batch.quantityRemaining, 0);
});

productSchema.virtual('averageCostPrice').get(function() {
    if (!this.inventoryBatches || !Array.isArray(this.inventoryBatches)) return 0;
    const totalCost = this.inventoryBatches.reduce((sum, batch) =>
        sum + (batch.costPrice * batch.quantityRemaining), 0);
    const totalQuantity = this.totalQuantityAvailable;
    return totalQuantity > 0 ? totalCost / totalQuantity : 0;
});

// Virtual field: Display price for customers (FIFO - oldest batch price)
productSchema.virtual('displayPrice').get(function() {
    if (!this.inventoryBatches || !Array.isArray(this.inventoryBatches)) return this.sellingPrice;
    // Find the oldest batch with remaining quantity
    const availableBatches = this.inventoryBatches
        .filter(batch => batch.quantityRemaining > 0)
        .sort((a, b) => new Date(a.receivedDate) - new Date(b.receivedDate));

    if (availableBatches.length > 0) {
        // Return selling price of oldest batch, fallback to product's sellingPrice
        return availableBatches[0].sellingPrice || this.sellingPrice;
    }

    // No stock - return product's default selling price
    return this.sellingPrice;
});

// Virtual field: Price range (min - max) for display
productSchema.virtual('priceRange').get(function() {
    if (!this.inventoryBatches || !Array.isArray(this.inventoryBatches)) return null;
    const availableBatches = this.inventoryBatches
        .filter(batch => batch.quantityRemaining > 0);

    if (availableBatches.length === 0) {
        return { min: this.sellingPrice, max: this.sellingPrice };
    }

    const prices = availableBatches.map(b => b.sellingPrice || this.sellingPrice);
    return {
        min: Math.min(...prices),
        max: Math.max(...prices)
    };
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

productSchema.methods.addInventoryBatch = function(batch) {
    this.inventoryBatches.push({
        quantityReceived: batch.quantity,
        quantityRemaining: batch.quantity,
        costPrice: batch.costPrice,
        receivedDate: batch.receivedDate || new Date()
    });
    return this.save();
};

productSchema.methods.updateModerationStatus = function(status, notes, reviewerId) {
    this.moderation.status = status;
    this.moderation.notes = notes;
    this.moderation.reviewedAt = new Date();
    this.moderation.reviewedBy = reviewerId;
    return this.save();
};

productSchema.methods.canFulfillQuantity = function(quantity) {
    return this.totalQuantityAvailable >= quantity;
};

productSchema.methods.reserveInventory = async function(quantity) {
    if (!this.canFulfillQuantity(quantity)) {
        throw new Error('Insufficient inventory');
    }

    let remainingToReserve = quantity;
    for (const batch of this.inventoryBatches) {
        if (remainingToReserve <= 0) break;

        const reserveFromBatch = Math.min(batch.quantityRemaining, remainingToReserve);
        batch.quantityRemaining -= reserveFromBatch;
        remainingToReserve -= reserveFromBatch;
    }

    this.inventoryBatches = this.inventoryBatches.filter(batch => 
        batch.quantityRemaining > 0
    );

    return this.save();
};

productSchema.statics.findActiveByCategory = function(categoryId) {
    return this.find({
        categoryId,
        'moderation.status': 'ACTIVE'
    }).sort('-createdAt');
};

productSchema.statics.findLowStock = function(threshold = 5) {
    return this.find({
        'moderation.status': 'ACTIVE'
    }).select('+totalQuantityAvailable')
    .then(products => 
        products.filter(product => 
            product.totalQuantityAvailable <= threshold
        )
    );
};

module.exports = mongoose.model('Product', productSchema);
