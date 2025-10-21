const express = require('express');
const router = express.Router();
const shipperController = require('../controllers/shipperController');
const { auth, requireRole } = require('../middleware/auth');

// Tất cả routes cần xác thực
router.use(auth);

// Dashboard
router.get('/dashboard/:userId', shipperController.getDashboardStats);

// Orders Management
router.get('/orders/:userId', shipperController.getOrders);
router.get('/shipment/:shipmentId', shipperController.getOrderDetail);
router.put('/shipment/:shipmentId/status', shipperController.updateOrderStatus);

// Earnings
router.get('/earnings/:userId', shipperController.getEarnings);

// Profile
router.get('/profile/:userId', shipperController.getProfile);
router.put('/profile/:userId', shipperController.updateProfile);

// Status & Location
router.put('/status/:userId', shipperController.toggleOnlineStatus);
router.put('/location/:userId', shipperController.updateLocation);

module.exports = router;
