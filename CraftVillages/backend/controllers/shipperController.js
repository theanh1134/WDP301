const Shipper = require('../models/Shipper');
const Shipment = require('../models/Shipment');
const ShipperEarnings = require('../models/ShipperEarnings');
const ShipperReview = require('../models/ShipperReview');
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
        const { latitude, longitude } = req.body;

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

// Confirm Delivery - Upload photos and complete delivery
const confirmDelivery = async (req, res, next) => {
    try {
        const { shipmentId } = req.params;
        const { notes } = req.body;
        const photos = req.files ? req.files.map(file => `/uploads/chat/${file.filename}`) : [];

        // Find shipment
        const shipment = await Shipment.findById(shipmentId);
        if (!shipment) {
            return res.status(404).json({
                success: false,
                message: 'Shipment not found'
            });
        }

        // Validate shipper authorization
        if (shipment.shipperId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to confirm this delivery'
            });
        }

        // Update shipment status to DELIVERED
        shipment.status = 'DELIVERED';
        shipment.actualDeliveryTime = new Date();
        shipment.deliveryProof = {
            photos: photos,
            notes: notes || ''
        };

        // Add to tracking history
        shipment.trackingHistory.push({
            status: 'DELIVERED',
            timestamp: new Date(),
            notes: 'Delivery confirmed'
        });

        await shipment.save();

        // Create earnings record
        try {
            const shipper = await Shipper.findById(shipment.shipperId);
            const baseFee = shipment.shippingFee?.baseFee || 0;
            const distanceFee = shipment.shippingFee?.distanceFee || 0;
            const weightFee = shipment.shippingFee?.weightFee || 0;
            const bonus = shipment.shippingFee?.bonus || 0;

            const totalEarnings = baseFee + distanceFee + weightFee + bonus;

            const earnings = new ShipperEarnings({
                shipperId: shipment.shipperId,
                orderId: shipment.orderId,
                shipmentId: shipment._id,
                earnings: {
                    baseFee,
                    distanceFee,
                    weightFee,
                    bonus,
                    deductions: 0,
                    total: totalEarnings
                },
                status: 'COMPLETED'
            });

            await earnings.save();

            // Update shipper stats
            if (shipper) {
                shipper.totalDeliveries += 1;
                shipper.totalEarnings += totalEarnings;
                await shipper.save();
            }
        } catch (error) {
            console.error('Error creating earnings record:', error);
        }

        res.status(200).json({
            success: true,
            message: 'Delivery confirmed successfully',
            data: shipment
        });
    } catch (error) {
        next(error);
    }
};

// Get Shipper Reviews
const getReviews = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        // Find shipper
        const shipper = await Shipper.findOne({ userId });
        if (!shipper) {
            return res.status(404).json({
                success: false,
                message: 'Shipper not found'
            });
        }

        // Get reviews from ShipperReview model
        const reviews = await ShipperReview.find({ 
            shipperId: shipper._id,
            status: 'ACTIVE'
        })
            .populate('customerId', 'fullName avatarUrl')
            .populate('orderId', 'buyerInfo')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await ShipperReview.countDocuments({ 
            shipperId: shipper._id,
            status: 'ACTIVE'
        });

        // Calculate statistics
        const allReviews = await ShipperReview.find({ 
            shipperId: shipper._id,
            status: 'ACTIVE'
        });

        const stats = {
            averageRating: allReviews.length > 0 
                ? (allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length).toFixed(1)
                : 0,
            totalReviews: allReviews.length,
            ratingDistribution: {
                5: allReviews.filter(r => r.rating === 5).length,
                4: allReviews.filter(r => r.rating === 4).length,
                3: allReviews.filter(r => r.rating === 3).length,
                2: allReviews.filter(r => r.rating === 2).length,
                1: allReviews.filter(r => r.rating === 1).length
            }
        };

        res.status(200).json({
            success: true,
            data: reviews,
            statistics: stats,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total
            }
        });
    } catch (error) {
        next(error);
    }
};

// Update Shipper Settings
const updateSettings = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { workingHours, serviceAreas } = req.body;

        // Validate input
        if (workingHours) {
            if (!workingHours.start || !workingHours.end) {
                return res.status(400).json({
                    success: false,
                    message: 'Working hours must have start and end time'
                });
            }
        }

        if (serviceAreas && !Array.isArray(serviceAreas)) {
            return res.status(400).json({
                success: false,
                message: 'Service areas must be an array'
            });
        }

        // Update shipper settings
        const updateData = {};
        if (workingHours) updateData.workingHours = workingHours;
        if (serviceAreas) updateData.serviceAreas = serviceAreas;

        const shipper = await Shipper.findOneAndUpdate(
            { userId },
            updateData,
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
            message: 'Settings updated successfully',
            data: shipper
        });
    } catch (error) {
        next(error);
    }
};

// Export Earnings Report
const exportEarnings = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { startDate, endDate, format = 'csv' } = req.query;

        const shipper = await Shipper.findOne({ userId });
        if (!shipper) {
            return res.status(404).json({
                success: false,
                message: 'Shipper not found'
            });
        }

        // Build query
        const query = { shipperId: shipper._id };
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        // Get earnings data
        const earnings = await ShipperEarnings.find(query)
            .populate('orderId', 'buyerInfo')
            .sort({ date: -1 });

        // Calculate totals
        const totals = {
            totalEarnings: 0,
            totalBonus: 0,
            totalDeductions: 0,
            totalRecords: earnings.length
        };

        earnings.forEach(record => {
            totals.totalEarnings += record.earnings.total;
            totals.totalBonus += record.earnings.bonus;
            totals.totalDeductions += record.earnings.deductions;
        });

        if (format === 'csv') {
            // Generate CSV
            let csv = 'Date,Order ID,Base Fee,Distance Fee,Weight Fee,Bonus,Deductions,Total,Status\n';
            earnings.forEach(record => {
                const row = [
                    new Date(record.date).toLocaleDateString(),
                    record.orderId?._id || 'N/A',
                    record.earnings.baseFee,
                    record.earnings.distanceFee,
                    record.earnings.weightFee,
                    record.earnings.bonus,
                    record.earnings.deductions,
                    record.earnings.total,
                    record.status
                ];
                csv += row.join(',') + '\n';
            });

            // Add summary
            csv += '\nSummary\n';
            csv += `Total Earnings,${totals.totalEarnings}\n`;
            csv += `Total Bonus,${totals.totalBonus}\n`;
            csv += `Total Deductions,${totals.totalDeductions}\n`;

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="earnings-report.csv"');
            res.send(csv);
        } else {
            // Return JSON for PDF generation on frontend
            res.status(200).json({
                success: true,
                data: {
                    shipper: {
                        name: shipper.userId,
                        licenseNumber: shipper.licenseNumber
                    },
                    earnings: earnings,
                    totals: totals,
                    period: {
                        startDate: startDate || 'All time',
                        endDate: endDate || new Date().toISOString()
                    }
                }
            });
        }
    } catch (error) {
        next(error);
    }
};

// Rate Shipper (by customer after delivery)
const rateShipper = async (req, res, next) => {
    try {
        const { shipmentId } = req.params;
        const { rating, comment, aspects } = req.body;
        const userId = req.user._id; // Current user (customer)

        // Validate input
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        // Find shipment
        const shipment = await Shipment.findById(shipmentId)
            .populate('shipperId')
            .populate('orderId');

        if (!shipment) {
            return res.status(404).json({
                success: false,
                message: 'Shipment not found'
            });
        }

        // Check if shipment is delivered
        if (shipment.status !== 'DELIVERED') {
            return res.status(400).json({
                success: false,
                message: 'Can only rate delivered shipments'
            });
        }

        // Check if customer is the order buyer
        if (shipment.orderId.buyerInfo.userId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to rate this shipment'
            });
        }

        // Check if already reviewed
        const existingReview = await ShipperReview.findOne({ 
            shipmentId: shipmentId 
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'This shipment has already been reviewed'
            });
        }

        // Get customer name
        const customer = await User.findById(userId);

        // Create review
        const review = new ShipperReview({
            shipperId: shipment.shipperId._id,
            orderId: shipment.orderId._id,
            shipmentId: shipmentId,
            customerId: userId,
            customerName: customer?.fullName || 'Anonymous',
            rating,
            comment: comment || '',
            aspects: aspects || {}
        });

        await review.save();

        // Update shipper rating
        const allReviews = await ShipperReview.find({ 
            shipperId: shipment.shipperId._id,
            status: 'ACTIVE'
        });

        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

        const shipper = await Shipper.findByIdAndUpdate(
            shipment.shipperId._id,
            {
                'rating.average': avgRating.toFixed(1),
                'rating.totalReviews': allReviews.length
            },
            { new: true }
        );

        res.status(201).json({
            success: true,
            message: 'Shipper rated successfully',
            data: {
                review,
                shipperRating: shipper.rating
            }
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
    updateLocation,
    confirmDelivery,
    getReviews,
    updateSettings,
    exportEarnings,
    rateShipper
};
