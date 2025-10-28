const express = require('express');
const router = express.Router();
const { 
    getShipperSettings, 
    updateShipperSettings,
    getNotificationSettings,
    updateNotificationSettings,
    getWorkingHoursSettings,
    updateWorkingHoursSettings
} = require('../controllers/shipperSettingsController');
const { auth, requireRole } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get shipper settings
router.get('/:shipperId', getShipperSettings);

// Update full shipper settings
router.put('/:shipperId', requireRole('SHIPPER', 'ADMIN'), updateShipperSettings);

// Notification settings
router.get('/:shipperId/notifications', getNotificationSettings);
router.put('/:shipperId/notifications', requireRole('SHIPPER', 'ADMIN'), updateNotificationSettings);

// Working hours settings
router.get('/:shipperId/working-hours', getWorkingHoursSettings);
router.put('/:shipperId/working-hours', requireRole('SHIPPER', 'ADMIN'), updateWorkingHoursSettings);

module.exports = router;
