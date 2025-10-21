const Shipper = require('../models/Shipper');
const Shipment = require('../models/Shipment');
const ShipperEarnings = require('../models/ShipperEarnings');
const User = require('../models/User');

// Get Shipper Dashboard Stats
const getDashboardStats = async (req, res, next) => {
    try {
        const { userId } = req.params;

        // Find shipper
        const shipper = await Shipper.findOne({ userId });
        if (!shipper) {
            return res.status(404).json({
                success: false,
                message: 'Shipper not found'
            });
        }

        // Get shipments statistics
        const totalOrders = await Shipment.countDocuments({ shipperId: shipper._id });
        const completedOrders = await Shipment.countDocuments({
            shipperId: shipper._id,
            status: 'DELIVERED'
        });
        const pendingOrders = await Shipment.countDocuments({
            shipperId: shipper._id,
            status: { $in: ['ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'] }
        });

        // Get total earnings
        const earningsData = await ShipperEarnings.aggregate([
            { $match: { shipperId: shipper._id } },
            { $group: { _id: null, total: { $sum: '$earnings.total' } } }
        ]);
        const totalEarnings = earningsData.length > 0 ? earningsData[0].total : 0;

        res.status(200).json({
            success: true,
            data: {
                totalOrders,
                completedOrders,
                pendingOrders,
                totalEarnings,
                rating: shipper.rating.average,
                onlineStatus: shipper.isOnline,
                shipperInfo: {
                    licenseNumber: shipper.licenseNumber,
                    vehicleType: shipper.vehicleType,
                    vehicleNumber: shipper.vehicleNumber,
                    maxWeight: shipper.maxWeight,
                    maxVolume: shipper.maxVolume,
                    serviceAreas: shipper.serviceAreas,
                    workingHours: shipper.workingHours,
                    isOnline: shipper.isOnline
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get Shipper Orders
const getOrders = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { status, page = 1, limit = 10 } = req.query;

        const shipper = await Shipper.findOne({ userId });
        if (!shipper) {
            return res.status(404).json({
                success: false,
                message: 'Shipper not found'
            });
        }

        const query = { shipperId: shipper._id };
        if (status) {
            query.status = status;
        }

        const shipments = await Shipment.find(query)
            .populate('orderId')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Shipment.countDocuments(query);

        res.status(200).json({
            success: true,
            data: shipments,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get Order Detail
const getOrderDetail = async (req, res, next) => {
    try {
        const { shipmentId } = req.params;

        const shipment = await Shipment.findById(shipmentId)
            .populate('orderId')
            .populate('shipperId');

        if (!shipment) {
            return res.status(404).json({
                success: false,
                message: 'Shipment not found'
            });
        }

        res.status(200).json({
            success: true,
            data: shipment
        });
    } catch (error) {
        next(error);
    }
};

// Update Order Status
const updateOrderStatus = async (req, res, next) => {
    try {
        const { shipmentId } = req.params;
        const { status, notes, photos, latitude, longitude, address } = req.body;

        const shipment = await Shipment.findById(shipmentId);
        if (!shipment) {
            return res.status(404).json({
                success: false,
                message: 'Shipment not found'
            });
        }

        // Update status
        shipment.status = status;

        // Add to tracking history
        shipment.trackingHistory.push({
            status,
            location: {
                latitude,
                longitude,
                address
            },
            notes
        });

        // Update current location
        if (latitude && longitude) {
            shipment.currentLocation = {
                latitude,
                longitude,
                updatedAt: new Date()
            };
        }

        // If delivered, add proof
        if (status === 'DELIVERED') {
            shipment.actualDeliveryTime = new Date();
            shipment.deliveryProof = {
                photos: photos || [],
                notes: notes || ''
            };
        }

        await shipment.save();

        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            data: shipment
        });
    } catch (error) {
        next(error);
    }
};

// Get Earnings
const getEarnings = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { startDate, endDate, page = 1, limit = 10 } = req.query;

        const shipper = await Shipper.findOne({ userId });
        if (!shipper) {
            return res.status(404).json({
                success: false,
                message: 'Shipper not found'
            });
        }

        const query = { shipperId: shipper._id };
        
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const earnings = await ShipperEarnings.find(query)
            .sort({ date: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await ShipperEarnings.countDocuments(query);

        // Calculate totals
        const totals = await ShipperEarnings.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalEarnings: { $sum: '$earnings.total' },
                    totalBonus: { $sum: '$earnings.bonus' },
                    totalDeductions: { $sum: '$earnings.deductions' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: earnings,
            summary: totals.length > 0 ? totals[0] : {
                totalEarnings: 0,
                totalBonus: 0,
                totalDeductions: 0
            },
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get Shipper Profile
const getProfile = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const shipper = await Shipper.findOne({ userId });
        if (!shipper) {
            return res.status(404).json({
                success: false,
                message: 'Shipper profile not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    avatarUrl: user.avatarUrl
                },
                shipper
            }
        });
    } catch (error) {
        next(error);
    }
};

// Update Shipper Profile
const updateProfile = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { fullName, phoneNumber, licenseNumber, vehicleType, vehicleNumber, serviceAreas, workingHours } = req.body;

        // Update user info
        const user = await User.findByIdAndUpdate(
            userId,
            {
                fullName,
                phoneNumber
            },
            { new: true }
        );

        // Update shipper info
        const shipper = await Shipper.findOneAndUpdate(
            { userId },
            {
                licenseNumber,
                vehicleType,
                vehicleNumber,
                serviceAreas,
                workingHours
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user,
                shipper
            }
        });
    } catch (error) {
        next(error);
    }
};

// Toggle Online Status
const toggleOnlineStatus = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { isOnline } = req.body;

        const shipper = await Shipper.findOneAndUpdate(
            { userId },
            { isOnline },
            { new: true }
        );

        if (!shipper) {
            return res.status(404).json({
                success: false,
                message: 'Shipper not found'
            });
        }

        res.status(200).json({
            success: true,
            message: `Shipper is now ${isOnline ? 'online' : 'offline'}`,
            data: shipper
        });
    } catch (error) {
        next(error);
    }
};

// Update Location
const updateLocation = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { latitude, longitude, address } = req.body;

        const shipper = await Shipper.findOneAndUpdate(
            { userId },
            {
                'currentLocation.latitude': latitude,
                'currentLocation.longitude': longitude,
                'currentLocation.updatedAt': new Date()
            },
            { new: true }
        );

        if (!shipper) {
            return res.status(404).json({
                success: false,
                message: 'Shipper not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Location updated successfully',
            data: shipper
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboardStats,
    getOrders,
    getOrderDetail,
    updateOrderStatus,
    getEarnings,
    getProfile,
    updateProfile,
    toggleOnlineStatus,
    updateLocation
};
