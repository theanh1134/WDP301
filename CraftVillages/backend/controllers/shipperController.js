const Shipper = require('../models/Shipper');
const Shipment = require('../models/Shipment');
const ShipperEarnings = require('../models/ShipperEarnings');
const ShipperReview = require('../models/ShipperReview');
const User = require('../models/User');
const Order = require('../models/Order');
const Return = require('../models/Return');

// Get Shipper Dashboard Stats
const getDashboardStats = async (req, res, next) => {
    try {
        const { userId } = req.params;
        console.log('[getDashboardStats] Received request for userId:', userId);

        // Find shipper
        const shipper = await Shipper.findOne({ userId });
        console.log('[getDashboardStats] Found shipper:', shipper ? shipper._id : 'NOT FOUND');
        
        if (!shipper) {
            console.log('[getDashboardStats] No shipper found for userId:', userId);
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
            .populate({
                path: 'returnId',
                populate: [
                    { path: 'buyerId', select: 'fullName phoneNumber address' },
                    { path: 'shopId', select: 'shopName address contactNumber' },
                    { path: 'orderId', select: 'orderCode' }
                ]
            })
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

// Get Available Orders (orders without shipper)
const getAvailableOrders = async (req, res, next) => {
    try {
        console.log('[getAvailableOrders] Request received');
        const { page = 1, limit = 20 } = req.query;

        // Find shipments that don't have a shipper assigned yet
        // and order status is confirmed (ready for shipping)
        const query = {
            $or: [
                { shipperId: null },
                { shipperId: { $exists: false } }
            ],
            status: { $in: ['CREATED', 'PENDING', 'READY_FOR_PICKUP'] }
        };
        
        console.log('[getAvailableOrders] Query:', JSON.stringify(query));

        const shipments = await Shipment.find(query)
            .populate('orderId')
            .populate({
                path: 'returnId',
                populate: [
                    { path: 'buyerId', select: 'fullName phoneNumber address' },
                    { path: 'shopId', select: 'shopName address contactNumber' },
                    { path: 'orderId', select: 'orderCode' }
                ]
            })
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Shipment.countDocuments(query);
        
        console.log('[getAvailableOrders] Found shipments:', shipments.length);
        console.log('[getAvailableOrders] Total count:', total);

        res.status(200).json({
            success: true,
            data: shipments,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total
            }
        });
    } catch (error) {
        console.error('[getAvailableOrders] Error:', error);
        next(error);
    }
};

// Accept Order (shipper picks an order)
const acceptOrder = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { shipmentId } = req.body;

        // Find shipper
        const shipper = await Shipper.findOne({ userId });
        if (!shipper) {
            return res.status(404).json({
                success: false,
                message: 'Shipper not found'
            });
        }

        // Find shipment
        const shipment = await Shipment.findById(shipmentId);
        if (!shipment) {
            return res.status(404).json({
                success: false,
                message: 'Shipment not found'
            });
        }

        // Check if already assigned
        if (shipment.shipperId) {
            return res.status(400).json({
                success: false,
                message: 'Đơn hàng đã được shipper khác nhận'
            });
        }

        // Assign shipper
        shipment.shipperId = shipper._id;
        shipment.status = 'ASSIGNED';
        shipment.assignedAt = new Date();
        
        // Add to tracking history
        shipment.trackingHistory.push({
            status: 'ASSIGNED',
            notes: `Đơn hàng đã được shipper ${shipper.licenseNumber} nhận`,
            timestamp: new Date()
        });

        await shipment.save();

        res.status(200).json({
            success: true,
            message: 'Nhận đơn hàng thành công',
            data: shipment
        });
    } catch (error) {
        console.error('[acceptOrder] Error:', error);
        next(error);
    }
};

// Get Order Detail
const getOrderDetail = async (req, res, next) => {
    try {
        const { shipmentId } = req.params;

        const shipment = await Shipment.findById(shipmentId)
            .populate('orderId')
            .populate({
                path: 'returnId',
                populate: [
                    { path: 'buyerId', select: 'fullName phoneNumber address' },
                    { path: 'shopId', select: 'shopName address contactNumber' },
                    { path: 'orderId', select: 'orderCode' },
                    { path: 'items.productId', select: 'name images' }
                ]
            })
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

        // ⭐ Sync shipment status to order/return status
        if (shipment.shipmentType === 'DELIVERY' && shipment.orderId) {
            // Xử lý đơn giao hàng
            const order = await Order.findById(shipment.orderId);
            
            if (order) {
                let orderStatus = null;
                let orderMessage = '';
                
                // Map shipment status to order status
                switch (status) {
                    case 'PICKED_UP':
                        if (order.status === 'PENDING' || order.status === 'PROCESSING') {
                            orderStatus = 'CONFIRMED';
                            orderMessage = 'Shipper đã nhận hàng từ người bán';
                            shipment.actualPickupTime = new Date();
                        }
                        break;
                        
                    case 'OUT_FOR_DELIVERY':
                        if (order.status !== 'SHIPPED' && order.status !== 'DELIVERED') {
                            orderStatus = 'SHIPPED';
                            orderMessage = 'Đơn hàng đang được vận chuyển bởi shipper';
                        }
                        break;
                        
                    case 'DELIVERED':
                        if (order.status !== 'DELIVERED') {
                            orderStatus = 'DELIVERED';
                            orderMessage = 'Đơn hàng đã được giao thành công bởi shipper';
                            shipment.actualDeliveryTime = new Date();
                            shipment.deliveryProof = {
                                photos: photos || [],
                                notes: notes || ''
                            };
                        }
                        break;
                    
                    case 'FAILED':
                        // Không thay đổi order status khi giao thất bại
                        // Có thể thêm note vào order history
                        break;
                        
                    default:
                        // Other statuses don't need to sync
                        break;
                }
                
                // Update order status if mapped
                if (orderStatus) {
                    try {
                        await order.updateStatus(orderStatus, orderMessage);
                        await order.save();
                        console.log(`✅ Order ${order.orderNumber} status synced: ${order.status} → ${orderStatus}`);
                    } catch (error) {
                        console.error(`❌ Failed to sync order status:`, error.message);
                        // Continue even if order update fails
                    }
                }
            }
        } else if (shipment.shipmentType === 'RETURN_PICKUP' && shipment.returnId) {
            // Xử lý đơn hoàn hàng - shipper lấy hàng từ buyer và giao về shop
            const returnOrder = await Return.findById(shipment.returnId);
            
            if (returnOrder) {
                let returnStatus = null;
                let returnMessage = '';
                
                switch (status) {
                    case 'PICKED_UP':
                        // Shipper đã lấy hàng từ người mua
                        returnStatus = 'SHIPPED';
                        returnMessage = 'Shipper đã lấy hàng từ người mua';
                        shipment.actualPickupTime = new Date();
                        break;
                        
                    case 'OUT_FOR_DELIVERY':
                        // Shipper đang trên đường mang hàng về shop
                        returnStatus = 'SHIPPED';
                        returnMessage = 'Hàng hoàn đang được vận chuyển về shop';
                        break;
                        
                    case 'DELIVERED':
                        // Shipper đã giao hàng về shop thành công
                        returnStatus = 'RETURNED';
                        returnMessage = 'Hàng hoàn đã được giao về shop thành công';
                        shipment.actualDeliveryTime = new Date();
                        shipment.deliveryProof = {
                            photos: photos || [],
                            notes: notes || ''
                        };
                        break;
                        
                    case 'FAILED':
                        // Không lấy được hàng
                        returnMessage = 'Không thể lấy hàng hoàn từ người mua';
                        break;
                        
                    default:
                        break;
                }
                
                // Update return status if mapped
                if (returnStatus) {
                    try {
                        returnOrder.status = returnStatus;
                        returnOrder.statusEvents.push({
                            status: returnStatus,
                            at: new Date(),
                            by: { type: 'SYSTEM', id: shipment.shipperId },
                            note: returnMessage
                        });
                        await returnOrder.save();
                        console.log(`✅ Return ${returnOrder.rmaCode} status synced to: ${returnStatus}`);
                    } catch (error) {
                        console.error(`❌ Failed to sync return status:`, error.message);
                    }
                }
            }
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
            .populate({
                path: 'orderId',
                select: 'orderNumber finalAmount subtotal shippingAddress buyerInfo'
            })
            .populate({
                path: 'shipmentId',
                select: 'status distance actualDeliveryTime'
            })
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
        console.log('[getProfile] Received request for userId:', userId);
        console.log('[getProfile] Request params:', req.params);
        console.log('[getProfile] Request user:', req.user);

        const user = await User.findById(userId);
        console.log('[getProfile] Found user:', user ? user.email : 'NOT FOUND');
        
        if (!user) {
            console.log('[getProfile] User not found for ID:', userId);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const shipper = await Shipper.findOne({ userId });
        console.log('[getProfile] Found shipper:', shipper ? shipper._id : 'NOT FOUND');
        
        if (!shipper) {
            console.log('[getProfile] Shipper profile not found for userId:', userId);
            return res.status(404).json({
                success: false,
                message: 'Shipper profile not found'
            });
        }

        console.log('[getProfile] Sending success response');
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
        console.error('[getProfile] Error:', error);
        next(error);
    }
};

// Update Shipper Profile
const updateProfile = async (req, res, next) => {
    try {
        const { userId } = req.params;
        console.log('Update Profile Request for userId:', userId);
        console.log('Request body:', req.body);
        console.log('Request files:', req.files);
        
        const { 
            fullName, 
            phoneNumber, 
            licenseNumber, 
            vehicleType, 
            vehicleNumber, 
            maxWeight, 
            maxVolume,
            serviceAreas, 
            workingHours,
            bankInfo
        } = req.body;

        // Log values for debugging
        console.log('Extracted values:', {
            fullName, phoneNumber, licenseNumber, vehicleType, vehicleNumber,
            maxWeight, maxVolume, serviceAreas, workingHours, bankInfo
        });

        // Parse JSON strings from FormData if necessary
        let parsedWorkingHours, parsedServiceAreas, parsedBankInfo;
        
        try {
            parsedWorkingHours = typeof workingHours === 'string' 
                ? JSON.parse(workingHours) 
                : workingHours;
        } catch (err) {
            console.error('Error parsing workingHours:', err);
            parsedWorkingHours = workingHours;
        }
            
        try {
            parsedServiceAreas = typeof serviceAreas === 'string' 
                ? JSON.parse(serviceAreas) 
                : serviceAreas;
        } catch (err) {
            console.error('Error parsing serviceAreas:', err);
            parsedServiceAreas = serviceAreas;
        }
            
        try {
            parsedBankInfo = typeof bankInfo === 'string' 
                ? JSON.parse(bankInfo) 
                : bankInfo;
        } catch (err) {
            console.error('Error parsing bankInfo:', err);
            parsedBankInfo = bankInfo;
        }

        // Handle document files if present
        const documentPaths = {};
        
        if (req.files) {
            Object.keys(req.files).forEach(key => {
                if (key.startsWith('document_')) {
                    const docType = key.replace('document_', '');
                    documentPaths[docType] = `/uploads/shipper/${req.files[key].filename}`;
                }
            });
        }

        // Update user info
        const userUpdateData = {};
        if (fullName) userUpdateData.fullName = fullName;
        if (phoneNumber) userUpdateData.phoneNumber = phoneNumber;
        
        const user = await User.findByIdAndUpdate(
            userId,
            userUpdateData,
            { new: true }
        ).select('-password');

        // Update shipper info
        const updateData = {};
        
        if (licenseNumber) updateData.licenseNumber = licenseNumber;
        if (vehicleType) updateData.vehicleType = vehicleType;
        if (vehicleNumber) updateData.vehicleNumber = vehicleNumber;
        if (parsedServiceAreas) updateData.serviceAreas = parsedServiceAreas;
        if (parsedWorkingHours) updateData.workingHours = parsedWorkingHours;
        if (maxWeight) updateData.maxWeight = maxWeight;
        if (maxVolume) updateData.maxVolume = maxVolume;
        if (parsedBankInfo) updateData.bankInfo = parsedBankInfo;
        
        // Handle document uploads properly
        if (Object.keys(documentPaths).length > 0) {
            // Get existing shipper to preserve document paths that aren't being updated
            const existingShipper = await Shipper.findOne({ userId });
            const existingDocs = existingShipper?.documents || {};
            
            updateData.documents = {
                ...existingDocs,
                ...documentPaths
            };
            
            console.log('Updated documents:', updateData.documents);
        }

        const shipper = await Shipper.findOneAndUpdate(
            { userId },
            updateData,
            { new: true }
        ).populate('userId', '-password');

        // Ensure we have the shipper object
        if (!shipper) {
            return res.status(404).json({
                success: false,
                message: 'Shipper not found'
            });
        }

        console.log('Updated shipper:', shipper);

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

        // ⭐ Sync order status to DELIVERED
        const Order = require('../models/Order');
        const order = await Order.findById(shipment.orderId);
        if (order && order.status !== 'DELIVERED') {
            await order.updateStatus('DELIVERED', 'Đơn hàng đã được giao thành công bởi shipper');
            await order.save();
            console.log(`✅ Order ${order.orderNumber} status synced to DELIVERED`);
        }

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

// Upload Evidence Photos
const uploadEvidencePhotos = async (req, res, next) => {
    try {
        const { shipmentId } = req.params;
        const { status, notes } = req.body;
        
        console.log(`[uploadEvidencePhotos] Shipment: ${shipmentId}, Files: ${req.files?.length || 0}`);
        
        const shipment = await Shipment.findById(shipmentId);
        if (!shipment) {
            return res.status(404).json({
                success: false,
                message: 'Shipment not found'
            });
        }

        // Process uploaded photos
        const photoUrls = [];
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                const photoUrl = `/uploads/shipper/${file.filename}`;
                photoUrls.push(photoUrl);
                console.log(`Uploaded photo: ${photoUrl}`);
            });
        }

        // Add photos to tracking history
        if (!shipment.trackingHistory) {
            shipment.trackingHistory = [];
        }

        shipment.trackingHistory.push({
            status: status || shipment.status,
            notes: notes || `Uploaded ${photoUrls.length} evidence photos`,
            timestamp: new Date(),
            photos: photoUrls
        });

        // Store photos in shipment evidencePhotos array
        if (!shipment.evidencePhotos) {
            shipment.evidencePhotos = [];
        }
        shipment.evidencePhotos.push(...photoUrls);

        await shipment.save();

        res.status(200).json({
            success: true,
            message: `Uploaded ${photoUrls.length} photos successfully`,
            data: {
                shipment,
                photoUrls
            }
        });
    } catch (error) {
        console.error('[uploadEvidencePhotos] Error:', error);
        next(error);
    }
};

module.exports = {
    getDashboardStats,
    getOrders,
    getAvailableOrders,
    acceptOrder,
    getOrderDetail,
    updateOrderStatus,
    uploadEvidencePhotos,
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
