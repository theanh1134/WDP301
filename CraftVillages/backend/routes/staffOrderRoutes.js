const express = require('express');
const router = express.Router();
const {
    getAllStaffOrders,
    getStatistics,
    getAvailableShippers,
    assignOrderToShipper,
    getOrderDetail,
    getShipmentTracking,
    reassignOrder
} = require('../controllers/staffOrderController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Staff Order Management Routes

// Get all orders for staff (with filtering)
// Query params: status, search, page, limit
router.get('/', getAllStaffOrders);

// Get statistics for dashboard
router.get('/statistics', getStatistics);

// Get available shippers (online and approved)
router.get('/available-shippers', getAvailableShippers);

// Get order detail with shipment info
router.get('/:orderId', getOrderDetail);

// Assign an order to a shipper (creates Shipment record)
router.post('/:orderId/assign', assignOrderToShipper);

// Get shipment tracking for an order
router.get('/:orderId/shipment', getShipmentTracking);

// Reassign order to another shipper
router.put('/:orderId/reassign', reassignOrder);

module.exports = router;
