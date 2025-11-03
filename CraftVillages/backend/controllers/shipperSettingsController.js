const ShipperSettings = require('../models/ShipperSettings');
const Shipper = require('../models/Shipper');

/**
 * Get shipper settings
 * @route GET /api/shipper-settings/:shipperId
 * @access Private
 */
exports.getShipperSettings = async (req, res, next) => {
    try {
        const { shipperId } = req.params;

        // Verify shipper exists
        const shipper = await Shipper.findById(shipperId);
        if (!shipper) {
            return res.status(404).json({
                success: false,
                message: 'Shipper not found'
            });
        }

        let settings = await ShipperSettings.findOne({ shipperId });

        // If settings don't exist, create default settings
        if (!settings) {
            settings = await ShipperSettings.create({
                shipperId,
                notifications: {
                    newOrder: true,
                    deliveryReminder: true,
                    paymentReceived: true,
                    ratingReceived: true
                },
                workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'],
                maxOrdersPerDay: 50,
                autoAcceptOrders: false,
                language: 'vi'
            });
        }

        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update shipper settings
 * @route PUT /api/shipper-settings/:shipperId
 * @access Private/Shipper/Admin
 */
exports.updateShipperSettings = async (req, res, next) => {
    try {
        const { shipperId } = req.params;
        const { notifications, workingDays, maxOrdersPerDay, preferredZones, autoAcceptOrders, language } = req.body;

        // Check authorization
        const userRole = req.user.roleId?.roleName || req.user.role;
        if (userRole === 'SHIPPER' && req.user._id.toString() !== shipperId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update these settings'
            });
        }

        let settings = await ShipperSettings.findOne({ shipperId });

        if (!settings) {
            settings = await ShipperSettings.create({
                shipperId,
                notifications: notifications || {
                    newOrder: true,
                    deliveryReminder: true,
                    paymentReceived: true,
                    ratingReceived: true
                },
                workingDays: workingDays || ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'],
                maxOrdersPerDay: maxOrdersPerDay || 50,
                preferredZones: preferredZones || [],
                autoAcceptOrders: autoAcceptOrders || false,
                language: language || 'vi'
            });
        } else {
            if (notifications) settings.notifications = notifications;
            if (workingDays) settings.workingDays = workingDays;
            if (maxOrdersPerDay !== undefined) settings.maxOrdersPerDay = maxOrdersPerDay;
            if (preferredZones) settings.preferredZones = preferredZones;
            if (autoAcceptOrders !== undefined) settings.autoAcceptOrders = autoAcceptOrders;
            if (language) settings.language = language;
            
            settings = await settings.save();
        }

        res.json({
            success: true,
            message: 'Settings updated successfully',
            data: settings
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get notification settings
 * @route GET /api/shipper-settings/:shipperId/notifications
 * @access Private
 */
exports.getNotificationSettings = async (req, res, next) => {
    try {
        const { shipperId } = req.params;

        let settings = await ShipperSettings.findOne({ shipperId });

        if (!settings) {
            settings = await ShipperSettings.create({
                shipperId,
                notifications: {
                    newOrder: true,
                    deliveryReminder: true,
                    paymentReceived: true,
                    ratingReceived: true
                }
            });
        }

        res.json({
            success: true,
            data: settings.notifications
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update notification settings
 * @route PUT /api/shipper-settings/:shipperId/notifications
 * @access Private/Shipper/Admin
 */
exports.updateNotificationSettings = async (req, res, next) => {
    try {
        const { shipperId } = req.params;
        const { newOrder, deliveryReminder, paymentReceived, ratingReceived } = req.body;

        // Check authorization
        const userRole = req.user.roleId?.roleName || req.user.role;
        if (userRole === 'SHIPPER' && req.user._id.toString() !== shipperId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update these settings'
            });
        }

        let settings = await ShipperSettings.findOne({ shipperId });

        if (!settings) {
            settings = await ShipperSettings.create({
                shipperId,
                notifications: {
                    newOrder: newOrder !== undefined ? newOrder : true,
                    deliveryReminder: deliveryReminder !== undefined ? deliveryReminder : true,
                    paymentReceived: paymentReceived !== undefined ? paymentReceived : true,
                    ratingReceived: ratingReceived !== undefined ? ratingReceived : true
                }
            });
        } else {
            if (newOrder !== undefined) settings.notifications.newOrder = newOrder;
            if (deliveryReminder !== undefined) settings.notifications.deliveryReminder = deliveryReminder;
            if (paymentReceived !== undefined) settings.notifications.paymentReceived = paymentReceived;
            if (ratingReceived !== undefined) settings.notifications.ratingReceived = ratingReceived;
            
            settings = await settings.save();
        }

        res.json({
            success: true,
            message: 'Notification settings updated successfully',
            data: settings.notifications
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get working hours settings
 * @route GET /api/shipper-settings/:shipperId/working-hours
 * @access Private
 */
exports.getWorkingHoursSettings = async (req, res, next) => {
    try {
        const { shipperId } = req.params;

        let settings = await ShipperSettings.findOne({ shipperId });

        if (!settings) {
            settings = await ShipperSettings.create({
                shipperId,
                workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
            });
        }

        res.json({
            success: true,
            data: {
                workingDays: settings.workingDays,
                maxOrdersPerDay: settings.maxOrdersPerDay
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update working hours settings
 * @route PUT /api/shipper-settings/:shipperId/working-hours
 * @access Private/Shipper/Admin
 */
exports.updateWorkingHoursSettings = async (req, res, next) => {
    try {
        const { shipperId } = req.params;
        const { workingDays, maxOrdersPerDay } = req.body;

        // Check authorization
        const userRole = req.user.roleId?.roleName || req.user.role;
        if (userRole === 'SHIPPER' && req.user._id.toString() !== shipperId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update these settings'
            });
        }

        let settings = await ShipperSettings.findOne({ shipperId });

        if (!settings) {
            settings = await ShipperSettings.create({
                shipperId,
                workingDays: workingDays || ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'],
                maxOrdersPerDay: maxOrdersPerDay || 50
            });
        } else {
            if (workingDays) settings.workingDays = workingDays;
            if (maxOrdersPerDay !== undefined) settings.maxOrdersPerDay = maxOrdersPerDay;
            
            settings = await settings.save();
        }

        res.json({
            success: true,
            message: 'Working hours settings updated successfully',
            data: {
                workingDays: settings.workingDays,
                maxOrdersPerDay: settings.maxOrdersPerDay
            }
        });
    } catch (error) {
        next(error);
    }
};
