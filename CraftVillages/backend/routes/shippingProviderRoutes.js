const express = require('express');
const router = express.Router();
const { 
    getAllProviders, 
    getProviderById, 
    createProvider,
    updateProvider,
    deleteProvider,
    getProvidersByZone,
    getProvidersByMethod
} = require('../controllers/shippingProviderController');
const { auth, requireRole } = require('../middleware/auth');

// Public routes
router.get('/', getAllProviders);
router.get('/zone/:zoneCode', getProvidersByZone);
router.get('/method/:methodCode', getProvidersByMethod);
router.get('/:providerId', getProviderById);

// Admin only routes
router.post('/', auth, requireRole('ADMIN'), createProvider);
router.put('/:providerId', auth, requireRole('ADMIN'), updateProvider);
router.delete('/:providerId', auth, requireRole('ADMIN'), deleteProvider);

module.exports = router;
