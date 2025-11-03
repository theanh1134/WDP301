const Order = require('../models/Order');
const Shipper = require('../models/Shipper');
const Shipment = require('../models/Shipment');

/**
 * Get all orders for staff management
 * Returns CONFIRMED orders that haven't been assigned to shippers yet
 * Or all orders based on filter
 */
const getAllStaffOrders = async (req, res, next) => {
    try {
        const { status, search, page = 1, limit = 20 } = req.query;

        // Build query
        let query = {};

        // Filter by status - default to CONFIRMED (ready to assign)
        if (status) {
            query.status = status.toUpperCase();
        } else {
            // Show CONFIRMED orders that need assignment
            query.status = { $in: ['CONFIRMED', 'SHIPPED'] };
        }

        // Search by order ID, customer name, or phone
        if (search) {
            query.$or = [
                { _id: { $regex: search, $options: 'i' } },
                { 'buyerInfo.fullName': { $regex: search, $options: 'i' } },
                { 'shippingAddress.phoneNumber': { $regex: search, $options: 'i' } }
            ];
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get orders
        const orders = await Order.find(query)
            .populate('buyerInfo.userId', 'fullName email phoneNumber')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip)
            .lean();

        // Get total count
        const total = await Order.countDocuments(query);

        // For each order, check if it has been assigned to a shipper
        const ordersWithShipmentStatus = await Promise.all(
            orders.map(async (order) => {
                const shipment = await Shipment.findOne({ orderId: order._id })
                    .populate('shipperId', 'userId vehicleType vehicleNumber')
                    .populate({
                        path: 'shipperId',
                        populate: {
                            path: 'userId',
                            select: 'fullName phoneNumber'
                        }
                    })
                    .lean();

                return {
                    ...order,
                    shipment: shipment || null,
                    isAssigned: !!shipment
                };
            })
        );

        res.status(200).json({
            success: true,
            data: ordersWithShipmentStatus,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching staff orders:', error);
        next(error);
    }
};

/**
 * Get statistics for staff orders dashboard
 */
const getStatistics = async (req, res, next) => {
    try {
        // Get assigned orders (has shipment record with ASSIGNED status)
        const assignedShipments = await Shipment.countDocuments({ 
            status: { $in: ['ASSIGNED', 'PICKED_UP'] } 
        });

        // Get delivering orders (shipment status is OUT_FOR_DELIVERY)
        const deliveringShipments = await Shipment.countDocuments({ 
            status: 'OUT_FOR_DELIVERY' 
        });

        // Total orders that are either confirmed or being shipped
        const totalOrders = await Order.countDocuments({
            status: { $in: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] }
        });

        // Pending orders = CONFIRMED but not assigned yet
        const allConfirmed = await Order.find({ status: 'CONFIRMED' }).select('_id').lean();
        const confirmedOrderIds = allConfirmed.map(o => o._id);
        
        const assignedOrderIds = await Shipment.find({
            orderId: { $in: confirmedOrderIds }
        }).distinct('orderId');

        const pendingCount = confirmedOrderIds.length - assignedOrderIds.length;

        res.status(200).json({
            success: true,
            data: {
                total: totalOrders,
                pending: Math.max(0, pendingCount),
                assigned: assignedShipments,
                delivering: deliveringShipments
            }
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        next(error);
    }
};

/**
 * Get available shippers (online and approved)
 */
const getAvailableShippers = async (req, res, next) => {
    try {
        const shippers = await Shipper.find({
            isOnline: true,
            status: 'APPROVED'
        })
            .populate('userId', 'fullName phoneNumber email avatarUrl')
            .sort({ totalDeliveries: -1 }) // Sort by experience
            .lean();

        res.status(200).json({
            success: true,
            data: shippers
        });
    } catch (error) {
        console.error('Error fetching available shippers:', error);
        next(error);
    }
};

/**
 * Assign an order to a shipper
 * Creates a Shipment record and updates Order status
 */
const assignOrderToShipper = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const { shipperId, pickupLocation, estimatedDeliveryTime } = req.body;

        // Validate input
        if (!shipperId) {
            return res.status(400).json({
                success: false,
                message: 'Shipper ID is required'
            });
        }

        // Check if order exists and is CONFIRMED
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (order.status !== 'CONFIRMED') {
            return res.status(400).json({
                success: false,
                message: `Order must be CONFIRMED to assign to shipper. Current status: ${order.status}`
            });
        }

        // Check if shipper exists and is available
        const shipper = await Shipper.findById(shipperId);
        if (!shipper) {
            return res.status(404).json({
                success: false,
                message: 'Shipper not found'
            });
        }

        if (shipper.status !== 'APPROVED') {
            return res.status(400).json({
                success: false,
                message: 'Shipper is not approved'
            });
        }

        // Check if order is already assigned
        const existingShipment = await Shipment.findOne({ orderId });
        if (existingShipment) {
            return res.status(400).json({
                success: false,
                message: 'Order is already assigned to a shipper',
                shipment: existingShipment
            });
        }

        // Calculate shipping fee based on distance and weight
        const calculateShippingFee = (order) => {
            const baseFee = 20000; // 20k VND base fee
            
            // Estimate weight from order items (you may want to add weight to product model)
            const estimatedWeight = order.items.length * 0.5; // Assume 0.5kg per item
            const weightFee = estimatedWeight > 1 ? (estimatedWeight - 1) * 5000 : 0;

            // Distance fee (can be calculated from pickup to delivery address using maps API)
            // For now, use a default
            const distanceFee = 15000;

            const total = baseFee + weightFee + distanceFee;

            return {
                baseFee,
                distanceFee,
                weightFee,
                total
            };
        };

        const shippingFee = calculateShippingFee(order);

        // Create shipment record
        const shipment = new Shipment({
            orderId: order._id,
            shipperId: shipper._id,
            assignedBy: req.user._id, // Staff user who assigned
            status: 'ASSIGNED',
            pickupLocation: pickupLocation || {
                address: 'Shop pickup location', // You may want to get this from shop
                latitude: 0,
                longitude: 0
            },
            deliveryLocation: {
                address: order.shippingAddress.fullAddress,
                latitude: 0, // Can be calculated from address
                longitude: 0
            },
            shippingFee: shippingFee,
            estimatedPickupTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
            estimatedDeliveryTime: estimatedDeliveryTime || new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
            trackingHistory: [
                {
                    status: 'ASSIGNED',
                    notes: `Assigned to shipper ${shipper.userId}`,
                    timestamp: new Date()
                }
            ]
        });

        await shipment.save();

        // Update order status to SHIPPED
        order.status = 'SHIPPED';
        await order.save();

        // Populate shipment data for response
        const populatedShipment = await Shipment.findById(shipment._id)
            .populate('shipperId')
            .populate('orderId')
            .populate({
                path: 'shipperId',
                populate: {
                    path: 'userId',
                    select: 'fullName phoneNumber email'
                }
            });

        res.status(201).json({
            success: true,
            message: 'Order assigned to shipper successfully',
            data: {
                shipment: populatedShipment,
                order: order
            }
        });
    } catch (error) {
        console.error('Error assigning order to shipper:', error);
        next(error);
    }
};

/**
 * Get order detail with shipment info
 */
const getOrderDetail = async (req, res, next) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId)
            .populate('buyerInfo.userId', 'fullName email phoneNumber')
            .lean();

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Get shipment info if exists
        const shipment = await Shipment.findOne({ orderId })
            .populate('shipperId')
            .populate({
                path: 'shipperId',
                populate: {
                    path: 'userId',
                    select: 'fullName phoneNumber email'
                }
            })
            .lean();

        res.status(200).json({
            success: true,
            data: {
                ...order,
                shipment: shipment || null
            }
        });
    } catch (error) {
        console.error('Error fetching order detail:', error);
        next(error);
    }
};

/**
 * Get shipment tracking for an order
 */
const getShipmentTracking = async (req, res, next) => {
    try {
        const { orderId } = req.params;

        const shipment = await Shipment.findOne({ orderId })
            .populate('shipperId')
            .populate('orderId')
            .populate({
                path: 'shipperId',
                populate: {
                    path: 'userId',
                    select: 'fullName phoneNumber email avatarUrl'
                }
            })
            .lean();

        if (!shipment) {
            return res.status(404).json({
                success: false,
                message: 'Shipment not found for this order'
            });
        }

        res.status(200).json({
            success: true,
            data: shipment
        });
    } catch (error) {
        console.error('Error fetching shipment tracking:', error);
        next(error);
    }
};

/**
 * Reassign order to another shipper
 */
const reassignOrder = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const { shipperId, reason } = req.body;

        // Find existing shipment
        const shipment = await Shipment.findOne({ orderId });
        if (!shipment) {
            return res.status(404).json({
                success: false,
                message: 'Shipment not found'
            });
        }

        // Check if shipment can be reassigned (not delivered or failed)
        if (['DELIVERED', 'FAILED'].includes(shipment.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot reassign shipment with status ${shipment.status}`
            });
        }

        // Verify new shipper
        const newShipper = await Shipper.findById(shipperId);
        if (!newShipper || newShipper.status !== 'APPROVED') {
            return res.status(400).json({
                success: false,
                message: 'Invalid or unavailable shipper'
            });
        }

        // Update shipment
        const oldShipperId = shipment.shipperId;
        shipment.shipperId = shipperId;
        shipment.status = 'ASSIGNED';
        shipment.trackingHistory.push({
            status: 'REASSIGNED',
            notes: `Reassigned from shipper ${oldShipperId} to ${shipperId}. Reason: ${reason || 'Not specified'}`,
            timestamp: new Date()
        });

        await shipment.save();

        const updatedShipment = await Shipment.findById(shipment._id)
            .populate('shipperId')
            .populate({
                path: 'shipperId',
                populate: {
                    path: 'userId',
                    select: 'fullName phoneNumber email'
                }
            });

        res.status(200).json({
            success: true,
            message: 'Order reassigned successfully',
            data: updatedShipment
        });
    } catch (error) {
        console.error('Error reassigning order:', error);
        next(error);
    }
};

module.exports = {
    getAllStaffOrders,
    getStatistics,
    getAvailableShippers,
    assignOrderToShipper,
    getOrderDetail,
    getShipmentTracking,
    reassignOrder
};
