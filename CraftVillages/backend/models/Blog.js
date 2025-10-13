const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    slug: {
        type: String,
        required: [true, 'Slug is required'],
        unique: true,
        trim: true
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    excerpt: {
        type: String,
        required: [true, 'Excerpt is required'],
        trim: true,
        maxlength: [500, 'Excerpt cannot exceed 500 characters']
    },
    content: {
        type: String,
        required: [true, 'Content is required']
    },
    heroImage: {
        type: String,
        required: [true, 'Hero image URL is required']
    },
    tags: [{
        type: String,
        trim: true
    }],
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category is required']
    },
    relatedProductIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    author: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Author user ID is required']
        },
        displayName: {
            type: String,
            required: [true, 'Author display name is required'],
            trim: true
        }
    },
    status: {
        type: String,
        enum: ['DRAFT', 'PUBLISHED'],
        default: 'DRAFT'
    },
    featured: {
        type: Boolean,
        default: false
    },
    readingTime: {
        type: Number,
        required: [true, 'Reading time is required'],
        min: [1, 'Reading time must be at least 1 minute']
    },
    views: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0
    },
    keywords: [{
        type: String,
        trim: true
    }],
    locale: {
        type: String,
        default: 'vi-VN'
    },
    visibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'public'
    },
    allowComments: {
        type: Boolean,
        default: true
    },
    pinned: {
        type: Boolean,
        default: false
    },
    publishedAt: {
        type: Date
    },
    seo: {
        title: {
            type: String,
            required: [true, 'SEO title is required'],
            trim: true,
            maxlength: [60, 'SEO title cannot exceed 60 characters']
        },
        description: {
            type: String,
            required: [true, 'SEO description is required'],
            trim: true,
            maxlength: [160, 'SEO description cannot exceed 160 characters']
        },
        ogImage: {
            type: String,
            required: [true, 'OG image URL is required']
        }
    },
    social: {
        twitterCard: {
            type: String,
            enum: ['summary', 'summary_large_image'],
            default: 'summary_large_image'
        },
        ogType: {
            type: String,
            default: 'article'
        }
    }
}, {
    timestamps: true
});

// Create indexes for common queries
blogSchema.index({ slug: 1 });
blogSchema.index({ categoryId: 1 });
blogSchema.index({ 'author.userId': 1 });
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ featured: 1 });
blogSchema.index({ tags: 1 });

module.exports = mongoose.model('Blog', blogSchema);
