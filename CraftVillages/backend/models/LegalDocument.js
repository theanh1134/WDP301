const mongoose = require('mongoose');

const legalDocumentSchema = new mongoose.Schema({
    documentName: {
        type: String,
        required: [true, 'Document name is required'],
        enum: {
            values: ['PrivacyPolicy', 'ReturnPolicy', 'TermsOfService', 'ShippingPolicy', 'CookiePolicy'],
            message: '{VALUE} is not a valid document name'
        },
        unique: true
    },
    title: {
        type: String,
        required: [true, 'Document title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    version: {
        type: String,
        required: [true, 'Version number is required'],
        trim: true,
        validate: {
            validator: function(v) {
                return /^\d+\.\d+(\.\d+)?$/.test(v);
            },
            message: props => `${props.value} is not a valid version number! Use format: major.minor[.patch]`
        }
    },
    content: {
        type: String,
        required: [true, 'Document content is required'],
        trim: true
    },
    lastUpdatedAt: {
        type: Date,
        default: Date.now
    },
    previousVersions: [{
        version: String,
        content: String,
        updatedAt: Date,
        changeLog: String
    }]
}, {
    timestamps: true
});

// Index for quick lookups
legalDocumentSchema.index({ documentName: 1 }, { unique: true });
legalDocumentSchema.index({ lastUpdatedAt: -1 });

// Version comparison utility
legalDocumentSchema.methods.isNewerThan = function(otherVersion) {
    const current = this.version.split('.').map(Number);
    const other = otherVersion.split('.').map(Number);
    
    for (let i = 0; i < Math.max(current.length, other.length); i++) {
        const a = current[i] || 0;
        const b = other[i] || 0;
        if (a !== b) return a > b;
    }
    return false;
};

// Update document with version history
legalDocumentSchema.methods.updateContent = function(newContent, newVersion, changeLog = '') {
    // Store current version in history
    this.previousVersions.push({
        version: this.version,
        content: this.content,
        updatedAt: this.lastUpdatedAt,
        changeLog: changeLog
    });

    // Update to new version
    this.content = newContent;
    this.version = newVersion;
    this.lastUpdatedAt = new Date();

    return this.save();
};

// Get version history
legalDocumentSchema.methods.getVersionHistory = function() {
    return [
        {
            version: this.version,
            updatedAt: this.lastUpdatedAt,
            isCurrent: true
        },
        ...this.previousVersions.map(v => ({
            version: v.version,
            updatedAt: v.updatedAt,
            isCurrent: false,
            changeLog: v.changeLog
        }))
    ].sort((a, b) => {
        if (a.isCurrent) return -1;
        if (b.isCurrent) return 1;
        return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
};

// Get specific version content
legalDocumentSchema.methods.getVersionContent = function(version) {
    if (version === this.version) {
        return {
            content: this.content,
            updatedAt: this.lastUpdatedAt,
            isCurrent: true
        };
    }

    const historicalVersion = this.previousVersions.find(v => v.version === version);
    if (!historicalVersion) {
        throw new Error(`Version ${version} not found`);
    }

    return {
        content: historicalVersion.content,
        updatedAt: historicalVersion.updatedAt,
        isCurrent: false,
        changeLog: historicalVersion.changeLog
    };
};

module.exports = mongoose.model('LegalDocument', legalDocumentSchema);
