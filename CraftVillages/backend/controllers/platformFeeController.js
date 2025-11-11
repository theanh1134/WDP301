const PlatformFeeConfig = require('../models/PlatformFeeConfig');

/**
 * Get all platform fee configurations
 */
const getAllFeeConfigs = async (req, res) => {
    try {
        const { isActive, sortBy = 'priority', sortOrder = -1 } = req.query;
        
        const query = {};
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }
        
        const sortObj = {};
        sortObj[sortBy] = parseInt(sortOrder);
        
        const configs = await PlatformFeeConfig.find(query)
            .sort(sortObj)
            .populate('applicableCategories', 'name')
            .populate('applicableShops', 'shopName')
            .populate('createdBy', 'fullName email')
            .populate('updatedBy', 'fullName email');
        
        res.json({
            success: true,
            data: configs,
            count: configs.length
        });
    } catch (error) {
        console.error('Error getting fee configs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get fee configurations',
            error: error.message
        });
    }
};

/**
 * Get single platform fee configuration
 */
const getFeeConfig = async (req, res) => {
    try {
        const { id } = req.params;
        
        const config = await PlatformFeeConfig.findById(id)
            .populate('applicableCategories', 'name')
            .populate('applicableShops', 'shopName')
            .populate('createdBy', 'fullName email')
            .populate('updatedBy', 'fullName email');
        
        if (!config) {
            return res.status(404).json({
                success: false,
                message: 'Fee configuration not found'
            });
        }
        
        res.json({
            success: true,
            data: config
        });
    } catch (error) {
        console.error('Error getting fee config:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get fee configuration',
            error: error.message
        });
    }
};

/**
 * Create new platform fee configuration
 */
const createFeeConfig = async (req, res) => {
    try {
        const configData = req.body;
        
        // Add creator info if user is authenticated
        if (req.user) {
            configData.createdBy = req.user._id;
        }
        
        const config = new PlatformFeeConfig(configData);
        await config.save();
        
        console.log(`✅ Platform fee config created: ${config.name}`);
        
        res.status(201).json({
            success: true,
            message: 'Fee configuration created successfully',
            data: config
        });
    } catch (error) {
        console.error('Error creating fee config:', error);
        res.status(400).json({
            success: false,
            message: 'Failed to create fee configuration',
            error: error.message
        });
    }
};

/**
 * Update platform fee configuration
 */
const updateFeeConfig = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        // Add updater info if user is authenticated
        if (req.user) {
            updateData.updatedBy = req.user._id;
        }
        
        const config = await PlatformFeeConfig.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!config) {
            return res.status(404).json({
                success: false,
                message: 'Fee configuration not found'
            });
        }
        
        console.log(`✅ Platform fee config updated: ${config.name}`);
        
        res.json({
            success: true,
            message: 'Fee configuration updated successfully',
            data: config
        });
    } catch (error) {
        console.error('Error updating fee config:', error);
        res.status(400).json({
            success: false,
            message: 'Failed to update fee configuration',
            error: error.message
        });
    }
};

/**
 * Delete platform fee configuration
 */
const deleteFeeConfig = async (req, res) => {
    try {
        const { id } = req.params;
        
        const config = await PlatformFeeConfig.findByIdAndDelete(id);
        
        if (!config) {
            return res.status(404).json({
                success: false,
                message: 'Fee configuration not found'
            });
        }
        
        console.log(`✅ Platform fee config deleted: ${config.name}`);
        
        res.json({
            success: true,
            message: 'Fee configuration deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting fee config:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete fee configuration',
            error: error.message
        });
    }
};

/**
 * Calculate fee for a given amount
 */
const calculateFee = async (req, res) => {
    try {
        const { configId, orderAmount, shopId, categoryIds } = req.body;
        
        let config;
        
        if (configId) {
            // Use specific config
            config = await PlatformFeeConfig.findById(configId);
            if (!config) {
                return res.status(404).json({
                    success: false,
                    message: 'Fee configuration not found'
                });
            }
        } else {
            // Find applicable config
            config = await PlatformFeeConfig.getApplicableConfig({
                shopId,
                categoryIds,
                orderAmount
            });
            
            if (!config) {
                return res.status(404).json({
                    success: false,
                    message: 'No applicable fee configuration found'
                });
            }
        }
        
        const feeCalculation = config.calculateFee(orderAmount);
        
        res.json({
            success: true,
            data: {
                ...feeCalculation,
                orderAmount: orderAmount,
                formattedOrderAmount: `${orderAmount.toLocaleString()} VND`,
                formattedFeeAmount: `${feeCalculation.feeAmount.toLocaleString()} VND`,
                formattedNetAmount: `${feeCalculation.netAmount.toLocaleString()} VND`
            }
        });
    } catch (error) {
        console.error('Error calculating fee:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to calculate fee',
            error: error.message
        });
    }
};

/**
 * Get applicable fee config for order
 */
const getApplicableConfig = async (req, res) => {
    try {
        const { shopId, categoryIds, orderAmount } = req.query;
        
        const config = await PlatformFeeConfig.getApplicableConfig({
            shopId,
            categoryIds: categoryIds ? JSON.parse(categoryIds) : [],
            orderAmount: orderAmount ? parseFloat(orderAmount) : 0
        });
        
        if (!config) {
            return res.status(404).json({
                success: false,
                message: 'No applicable fee configuration found'
            });
        }
        
        res.json({
            success: true,
            data: config
        });
    } catch (error) {
        console.error('Error getting applicable config:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get applicable configuration',
            error: error.message
        });
    }
};

/**
 * Initialize default platform fee configuration
 */
const initializeDefault = async (req, res) => {
    try {
        const defaultConfig = await PlatformFeeConfig.createDefault();
        
        res.json({
            success: true,
            message: 'Default fee configuration initialized',
            data: defaultConfig
        });
    } catch (error) {
        console.error('Error initializing default config:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to initialize default configuration',
            error: error.message
        });
    }
};

module.exports = {
    getAllFeeConfigs,
    getFeeConfig,
    createFeeConfig,
    updateFeeConfig,
    deleteFeeConfig,
    calculateFee,
    getApplicableConfig,
    initializeDefault
};

