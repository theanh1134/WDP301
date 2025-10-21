const Shop = require('../models/Shop');
const User = require('../models/User');

// Create a new shop (seller registration)
exports.createShop = async (req, res) => {
    try {
        const { 
            sellerId, 
            shopName, 
            description, 
            bannerUrl,
            businessType,
            pickupAddress,
            taxCode 
        } = req.body;

        // Validate required fields
        if (!sellerId || !shopName) {
            return res.status(400).json({
                success: false,
                message: 'Seller ID and shop name are required'
            });
        }

        // Check if user exists
        const user = await User.findById(sellerId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user already has a shop
        const existingShop = await Shop.findOne({ sellerId });
        if (existingShop) {
            return res.status(400).json({
                success: false,
                message: 'User already has a shop',
                data: existingShop
            });
        }

        // Create new shop
        const shop = new Shop({
            sellerId,
            shopName,
            description: description || '',
            bannerUrl: bannerUrl || 'https://via.placeholder.com/1200x300?text=Shop+Banner',
            isActive: true
        });

        await shop.save();

        res.status(201).json({
            success: true,
            message: 'Shop created successfully',
            data: shop
        });
    } catch (error) {
        console.error('Create shop error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create shop'
        });
    }
};

// Get shop by user ID
exports.getShopByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        const shop = await Shop.findOne({ sellerId: userId })
            .populate('sellerId', 'fullName email phoneNumber avatarUrl');

        if (!shop) {
            return res.status(404).json({
                success: false,
                message: 'Shop not found'
            });
        }

        res.status(200).json({
            success: true,
            data: shop
        });
    } catch (error) {
        console.error('Get shop error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get shop'
        });
    }
};

// Get shop by shop ID
exports.getShopById = async (req, res) => {
    try {
        const { shopId } = req.params;

        const shop = await Shop.findById(shopId)
            .populate('sellerId', 'fullName email phoneNumber avatarUrl');

        if (!shop) {
            return res.status(404).json({
                success: false,
                message: 'Shop not found'
            });
        }

        res.status(200).json({
            success: true,
            data: shop
        });
    } catch (error) {
        console.error('Get shop error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get shop'
        });
    }
};

// Get all shops
exports.getAllShops = async (req, res) => {
    try {
        const { isActive, limit = 10, page = 1 } = req.query;

        const query = {};
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        const shops = await Shop.find(query)
            .populate('sellerId', 'fullName email phoneNumber avatarUrl')
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Shop.countDocuments(query);

        res.status(200).json({
            success: true,
            data: shops,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get shops error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get shops'
        });
    }
};

// Update shop
exports.updateShop = async (req, res) => {
    try {
        const { shopId } = req.params;
        const updates = req.body;

        // Don't allow updating sellerId
        delete updates.sellerId;

        const shop = await Shop.findByIdAndUpdate(
            shopId,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!shop) {
            return res.status(404).json({
                success: false,
                message: 'Shop not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Shop updated successfully',
            data: shop
        });
    } catch (error) {
        console.error('Update shop error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update shop'
        });
    }
};

