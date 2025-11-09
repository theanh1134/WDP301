const express = require('express');
const router = express.Router();
const platformFeeController = require('../controllers/platformFeeController');
const { auth } = require('../middleware/auth');

// Public routes
router.get('/applicable', platformFeeController.getApplicableConfig);
router.post('/calculate', platformFeeController.calculateFee);

// Protected routes (require authentication)
router.get('/', auth, platformFeeController.getAllFeeConfigs);
router.get('/:id', auth, platformFeeController.getFeeConfig);
router.post('/', auth, platformFeeController.createFeeConfig);
router.put('/:id', auth, platformFeeController.updateFeeConfig);
router.delete('/:id', auth, platformFeeController.deleteFeeConfig);
router.post('/initialize-default', auth, platformFeeController.initializeDefault);

module.exports = router;

