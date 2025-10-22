const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const shipperController = require('../controllers/shipperController');
const { auth } = require('../middleware/auth');

// Configure multer for uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Different destinations based on file type
        if (file.fieldname.startsWith('document_')) {
            cb(null, 'uploads/shipper/');
        } else {
            cb(null, 'uploads/chat/');
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        
        // Different file prefix based on file type
        let prefix = 'delivery';
        if (file.fieldname.startsWith('document_')) {
            prefix = 'shipper-doc';
        }
        
        cb(null, `${prefix}-${uniqueSuffix}${path.extname(file.originalname)}`);
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
router.put('/profile/:userId', upload.fields([
    { name: 'document_licenseImage', maxCount: 1 },
    { name: 'document_vehicleRegistration', maxCount: 1 },
    { name: 'document_insuranceDocument', maxCount: 1 },
    { name: 'document_identityCard', maxCount: 1 },
    { name: 'document_driverPhoto', maxCount: 1 }
]), shipperController.updateProfile);

// Settings
router.put('/settings/:userId', shipperController.updateSettings);

// Status & Location
router.put('/status/:userId', shipperController.toggleOnlineStatus);
router.put('/location/:userId', shipperController.updateLocation);

module.exports = router;
