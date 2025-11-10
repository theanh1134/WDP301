const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const adminRevenueController = require('../controllers/adminRevenueController');
const adminCommissionController = require('../controllers/adminCommissionController');

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
    try {
        const Role = require('../models/Role');
        const role = await Role.findById(req.user.roleId);
        
        if (!role || role.roleName !== 'ADMIN_BUSINESS') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }
        
        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error checking admin role',
            error: error.message
        });
    }
};

// Revenue routes
router.get('/revenue/overview', auth, isAdmin, adminRevenueController.getRevenueOverview);
router.get('/revenue/chart', auth, isAdmin, adminRevenueController.getRevenueChart);
router.get('/revenue/category', auth, isAdmin, adminRevenueController.getRevenueByCategory);

// Seller routes
router.get('/sellers/top', auth, isAdmin, adminRevenueController.getTopSellers);
router.get('/sellers/performance', auth, isAdmin, adminRevenueController.getSellerPerformance);

// Commission routes
router.get('/commission/analytics', auth, isAdmin, adminRevenueController.getCommissionAnalytics);
router.get('/commission/by-seller', auth, isAdmin, adminRevenueController.getCommissionBySeller);
router.get('/commission/by-region', auth, isAdmin, adminRevenueController.getCommissionByRegion);
router.get('/commission/history', auth, isAdmin, adminRevenueController.getCommissionHistory);
router.get('/commission/sellers', auth, isAdmin, adminCommissionController.listSellerCommissions);
router.get('/commission/sellers/:shopId/history', auth, isAdmin, adminCommissionController.getSellerCommissionHistory);
router.put('/commission/sellers/:shopId', auth, isAdmin, adminCommissionController.updateSellerCommission);
router.put('/commission/global', auth, isAdmin, adminCommissionController.updateGlobalCommission);

module.exports = router;

