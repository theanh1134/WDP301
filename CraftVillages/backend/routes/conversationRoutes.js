const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
    getConversationsByBuyer,
    getConversationsByShop,
    getConversationsByUserId,
    getConversationById,
    createConversation,
    sendMessage,
    markAsRead,
    archiveConversation,
    closeConversation,
    getOrCreateConversation
} = require('../controllers/conversationController');
const { auth } = require('../middleware/auth');

// Configure multer for chat image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/chat/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'chat-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 5 // Max 5 files
    },
    fileFilter: function (req, file, cb) {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ chấp nhận file ảnh!'), false);
        }
    }
});

// Get conversations
router.get('/user/:userId', auth, getConversationsByUserId);
router.get('/buyer/:buyerId', auth, getConversationsByBuyer);
router.get('/shop/:shopId', auth, getConversationsByShop);
router.get('/:conversationId', auth, getConversationById);

// Create/manage conversations
router.post('/', auth, createConversation);
router.post('/get-or-create', auth, getOrCreateConversation);

// Messages
router.post('/:conversationId/messages', auth, sendMessage);
router.post('/:conversationId/upload', auth, upload.array('images', 5), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No images uploaded'
            });
        }

        const imageUrls = req.files.map(file => `/uploads/chat/${file.filename}`);

        res.json({
            success: true,
            data: imageUrls,
            message: 'Images uploaded successfully'
        });
    } catch (error) {
        console.error('Error uploading images:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload images',
            error: error.message
        });
    }
});
router.put('/:conversationId/read', auth, markAsRead);

// Archive/Close
router.put('/:conversationId/archive', auth, archiveConversation);
router.put('/:conversationId/close', auth, closeConversation);

module.exports = router;

