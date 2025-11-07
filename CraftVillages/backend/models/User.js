const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        maxlength: [100, 'Full name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    passwordHash: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        match: [/^[0-9]{10,11}$/, 'Please enter a valid phone number']
    },
    avatarUrl: {
        type: String,
        default: ''
    },
    roleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
        required: [true, 'Role is required']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    addresses: [{
        type: mongoose.Schema.Types.Mixed
    }],
    legalAgreements: [{
        type: String,
        trim: true
    }],
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    verificationCode: {
        type: String,
        default: null
    },
    verificationCodeExpires: {
        type: Date,
        default: null
    },
    resetPasswordCode: {
        type: String,
        default: null
    },
    resetPasswordCodeExpires: {
        type: Date,
        default: null
    },
    balance: {
        type: Number,
        default: 0,
        min: [0, 'Balance cannot be negative']
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('passwordHash')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.methods.generateVerificationCode = function () {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.verificationCode = code;
    this.verificationCodeExpires = new Date(Date.now() + 3 * 60 * 1000);
    return code;
};

userSchema.methods.generateResetCode = function () {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.resetPasswordCode = code;
    this.resetPasswordCodeExpires = new Date(Date.now() + 3 * 60 * 1000);
    return code;
};

userSchema.methods.isVerificationCodeValid = function (code) {
    return this.verificationCode === code &&
        this.verificationCodeExpires &&
        this.verificationCodeExpires > new Date();
};

userSchema.methods.isResetCodeValid = function (code) {
    return this.resetPasswordCode === code &&
        this.resetPasswordCodeExpires &&
        this.resetPasswordCodeExpires > new Date();
};

// Balance management methods
userSchema.methods.addBalance = function (amount, description = '') {
    if (amount <= 0) {
        throw new Error('Amount must be greater than 0');
    }
    this.balance = (this.balance || 0) + amount;
    console.log(`💰 Added ${amount.toLocaleString()} VND to user ${this._id} balance. New balance: ${this.balance.toLocaleString()} VND. Reason: ${description}`);
    return this.save();
};

userSchema.methods.subtractBalance = function (amount, description = '', session = null) {
    if (amount <= 0) {
        throw new Error('Amount must be greater than 0');
    }
    if (this.balance < amount) {
        throw new Error('Insufficient balance');
    }
    this.balance = this.balance - amount;
    console.log(`💸 Subtracted ${amount.toLocaleString()} VND from user ${this._id} balance. New balance: ${this.balance.toLocaleString()} VND. Reason: ${description}`);

    // Support MongoDB session for transactions
    if (session) {
        return this.save({ session });
    }
    return this.save();
};

userSchema.methods.getBalance = function () {
    return this.balance || 0;
};

module.exports = mongoose.model('User', userSchema);

