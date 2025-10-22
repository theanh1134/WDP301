const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const shipperController = require('../controllers/shipperController');
const { auth } = require('../middleware/auth');

// Configure multer for delivery proof uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/chat/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'delivery-' + uniqueSuffix + path.extname(file.originalname));
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
            cb(new Error('Only image files are accepted!'), false);
        }
    }
});

// Tất cả routes cần xác thực
router.use(auth);

// Dashboard
router.get('/dashboard/:userId', shipperController.getDashboardStats);

// Orders Management
router.get('/orders/:userId', shipperController.getOrders);
router.get('/shipment/:shipmentId', shipperController.getOrderDetail);
router.put('/shipment/:shipmentId/status', shipperController.updateOrderStatus);
router.post('/orders/:shipmentId/confirm-delivery', upload.array('photos', 5), shipperController.confirmDelivery);

// Earnings
router.get('/earnings/:userId', shipperController.getEarnings);
router.get('/earnings/:userId/export', shipperController.exportEarnings);

// Reviews & Ratings
router.get('/reviews/:userId', shipperController.getReviews);
router.post('/shipment/:shipmentId/rate', shipperController.rateShipper);

// Profile
router.get('/profile/:userId', shipperController.getProfile);
router.put('/profile/:userId', shipperController.updateProfile);

// Settings
router.put('/settings/:userId', shipperController.updateSettings);

// Status & Location
router.put('/status/:userId', shipperController.toggleOnlineStatus);
router.put('/location/:userId', shipperController.updateLocation);

module.exports = router;
