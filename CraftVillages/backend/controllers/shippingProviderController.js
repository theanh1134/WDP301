const ShippingProvider = require('../models/ShippingProvider');

/**
 * Get all shipping providers
 * @route GET /api/shipping-providers
 * @access Public
 */
exports.getAllProviders = async (req, res, next) => {
    try {
        const { isActive, method, zone } = req.query;
        
        let query = {};
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }
        if (method) {
            query.supportedMethods = method;
        }
        if (zone) {
            query.supportedZones = zone;
        }

        const providers = await ShippingProvider.find(query).sort({ ratingAverage: -1 });
        
        res.json({
            success: true,
            count: providers.length,
            data: providers
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get provider by ID
 * @route GET /api/shipping-providers/:providerId
 * @access Public
 */
exports.getProviderById = async (req, res, next) => {
    try {
        const provider = await ShippingProvider.findById(req.params.providerId);
        
        if (!provider) {
            return res.status(404).json({
                success: false,
                message: 'Shipping provider not found'
            });
        }

        res.json({
            success: true,
            data: provider
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get providers by zone
 * @route GET /api/shipping-providers/zone/:zoneCode
 * @access Public
 */
exports.getProvidersByZone = async (req, res, next) => {
    try {
        const { zoneCode } = req.params;
        
        const providers = await ShippingProvider.find({
            supportedZones: zoneCode,
            isActive: true
        }).sort({ ratingAverage: -1 });

        res.json({
            success: true,
            count: providers.length,
            data: providers
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get providers by shipping method
 * @route GET /api/shipping-providers/method/:methodCode
 * @access Public
 */
exports.getProvidersByMethod = async (req, res, next) => {
    try {
        const { methodCode } = req.params;
        
        const providers = await ShippingProvider.find({
            supportedMethods: methodCode,
            isActive: true
        }).sort({ ratingAverage: -1 });

        res.json({
            success: true,
            count: providers.length,
            data: providers
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create new shipping provider
 * @route POST /api/shipping-providers
 * @access Private/Admin
 */
exports.createProvider = async (req, res, next) => {
    try {
        const { shipperCode, shipperName, contactPhone, supportedMethods, supportedZones, description, website, logo } = req.body;

        // Check if provider already exists
        const existingProvider = await ShippingProvider.findOne({ shipperCode });
        if (existingProvider) {
            return res.status(400).json({
                success: false,
                message: 'Shipping provider with this code already exists'
            });
        }

        const provider = await ShippingProvider.create({
            shipperCode,
            shipperName,
            contactPhone,
            supportedMethods,
            supportedZones,
            description,
            website,
            logo,
            isActive: true,
            ratingAverage: 5,
            ratingCount: 0
        });

        res.status(201).json({
            success: true,
            message: 'Shipping provider created successfully',
            data: provider
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update shipping provider
 * @route PUT /api/shipping-providers/:providerId
 * @access Private/Admin
 */
exports.updateProvider = async (req, res, next) => {
    try {
        const { providerId } = req.params;
        const updateFields = req.body;

        const provider = await ShippingProvider.findByIdAndUpdate(
            providerId,
            updateFields,
            { new: true, runValidators: true }
        );

        if (!provider) {
            return res.status(404).json({
                success: false,
                message: 'Shipping provider not found'
            });
        }

        res.json({
            success: true,
            message: 'Shipping provider updated successfully',
            data: provider
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete shipping provider
 * @route DELETE /api/shipping-providers/:providerId
 * @access Private/Admin
 */
exports.deleteProvider = async (req, res, next) => {
    try {
        const { providerId } = req.params;

        const provider = await ShippingProvider.findByIdAndDelete(providerId);

        if (!provider) {
            return res.status(404).json({
                success: false,
                message: 'Shipping provider not found'
            });
        }

        res.json({
            success: true,
            message: 'Shipping provider deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
