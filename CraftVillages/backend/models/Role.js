const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    roleName: {
        type: String,
        required: true,
        unique: true,
        enum: ['ADMIN_BUSINESS', 'SELLER_STAFF', 'RETURN_STAFF', 'SELLER', 'BUYER', 'SHIPPER']
    },
    description: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Role', roleSchema);

