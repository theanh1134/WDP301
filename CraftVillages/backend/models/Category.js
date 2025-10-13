const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
        maxlength: [200, 'Category name cannot exceed 200 characters']
    },
    parentCategoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);
