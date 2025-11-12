const Order = require('../models/Order');
const User = require('../models/User');
const Role = require('../models/Role');

/**
 * Get Customer Analytics Overview
 * Thống kê tổng quan về khách hàng
 */
const getCustomerOverview = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Build date filter
        const dateFilter = {};
        if (startDate) dateFilter.$gte = new Date(startDate);
        if (endDate) dateFilter.$lte = new Date(endDate);

        // Get BUYER role ID
        const buyerRole = await Role.findOne({ roleName: 'BUYER' });
        if (!buyerRole) {
            return res.status(404).json({
                success: false,
                message: 'Buyer role not found'
            });
        }

        // Total customers (all buyers)
        const totalCustomers = await User.countDocuments({ roleId: buyerRole._id });

        // Active customers (buyers who have placed orders)
        const activeCustomersData = await Order.aggregate([
            ...(Object.keys(dateFilter).length > 0 ? [{ $match: { createdAt: dateFilter } }] : []),
            {
                $match: {
                    status: { $nin: ['CANCELLED', 'REFUNDED'] }
                }
            },
            {
                $group: {
                    _id: '$buyerInfo.userId',
                    orderCount: { $sum: 1 }
                }
            }
        ]);

        const activeCustomers = activeCustomersData.length;

        // Calculate total revenue and order stats
        const orderStats = await Order.aggregate([
            ...(Object.keys(dateFilter).length > 0 ? [{ $match: { createdAt: dateFilter } }] : []),
            {
                $match: {
                    status: { $nin: ['CANCELLED', 'REFUNDED'] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$finalAmount' },
                    totalOrders: { $sum: 1 }
                }
            }
        ]);

        const stats = orderStats[0] || { totalRevenue: 0, totalOrders: 0 };
        const averageOrderValue = stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0;

        // Calculate repeat customer rate
        const repeatCustomers = activeCustomersData.filter(c => c.orderCount > 1).length;
        const repeatCustomerRate = activeCustomers > 0 ? (repeatCustomers / activeCustomers) * 100 : 0;

        console.log('📊 Customer Overview:', {
            totalCustomers,
            activeCustomers,
            averageOrderValue: Math.round(averageOrderValue),
            repeatCustomerRate: Math.round(repeatCustomerRate * 10) / 10
        });

        res.status(200).json({
            success: true,
            data: {
                totalCustomers,
                activeCustomers,
                averageOrderValue: Math.round(averageOrderValue),
                repeatCustomerRate: Math.round(repeatCustomerRate * 10) / 10
            }
        });

    } catch (error) {
        console.error('Error getting customer overview:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while getting customer overview',
            error: error.message
        });
    }
};

/**
 * Get Top Customers by Order Count
 * Top khách hàng theo số lượng đơn hàng
 */
const getTopCustomersByOrders = async (req, res) => {
    try {
        const { startDate, endDate, limit = 10 } = req.query;

        // Build date filter
        const dateFilter = {};
        if (startDate) dateFilter.$gte = new Date(startDate);
        if (endDate) dateFilter.$lte = new Date(endDate);

        const topCustomers = await Order.aggregate([
            ...(Object.keys(dateFilter).length > 0 ? [{ $match: { createdAt: dateFilter } }] : []),
            {
                $match: {
                    status: { $nin: ['CANCELLED', 'REFUNDED'] },
                    'buyerInfo.userId': { $exists: true, $ne: null }
                }
            },
            {
                $group: {
                    _id: '$buyerInfo.userId',
                    customerName: { $first: '$buyerInfo.fullName' },
                    orderCount: { $sum: 1 },
                    totalSpent: { $sum: '$finalAmount' }
                }
            },
            {
                $sort: { orderCount: -1 }
            },
            {
                $limit: parseInt(limit)
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            {
                $unwind: {
                    path: '$userDetails',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 0,
                    customerId: '$_id',
                    customerName: { $ifNull: ['$userDetails.fullName', '$customerName'] },
                    email: '$userDetails.email',
                    phoneNumber: '$userDetails.phoneNumber',
                    orderCount: 1,
                    totalSpent: 1,
                    averageOrderValue: {
                        $cond: [
                            { $gt: ['$orderCount', 0] },
                            { $divide: ['$totalSpent', '$orderCount'] },
                            0
                        ]
                    }
                }
            }
        ]);

        console.log('📊 Top Customers by Orders:', topCustomers.length, 'customers found');
        console.log('📊 Sample data:', JSON.stringify(topCustomers.slice(0, 2), null, 2));

        res.status(200).json({
            success: true,
            data: topCustomers
        });

    } catch (error) {
        console.error('Error getting top customers by orders:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while getting top customers by orders',
            error: error.message
        });
    }
};

/**
 * Get Top Customers by Revenue
 * Top khách hàng theo tổng chi tiêu
 */
const getTopCustomersByRevenue = async (req, res) => {
    try {
        const { startDate, endDate, limit = 10 } = req.query;

        // Build date filter
        const dateFilter = {};
        if (startDate) dateFilter.$gte = new Date(startDate);
        if (endDate) dateFilter.$lte = new Date(endDate);

        const topCustomers = await Order.aggregate([
            ...(Object.keys(dateFilter).length > 0 ? [{ $match: { createdAt: dateFilter } }] : []),
            {
                $match: {
                    status: { $nin: ['CANCELLED', 'REFUNDED'] }
                }
            },
            {
                $group: {
                    _id: '$buyerInfo.userId',
                    customerName: { $first: '$buyerInfo.fullName' },
                    totalSpent: { $sum: '$finalAmount' },
                    orderCount: { $sum: 1 }
                }
            },
            {
                $sort: { totalSpent: -1 }
            },
            {
                $limit: parseInt(limit)
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            {
                $unwind: {
                    path: '$userDetails',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    customerName: { $ifNull: ['$userDetails.fullName', '$customerName'] },
                    email: '$userDetails.email',
                    phoneNumber: '$userDetails.phoneNumber',
                    totalSpent: 1,
                    orderCount: 1,
                    averageOrderValue: {
                        $cond: [
                            { $gt: ['$orderCount', 0] },
                            { $divide: ['$totalSpent', '$orderCount'] },
                            0
                        ]
                    }
                }
            }
        ]);

        console.log('📊 Top Customers by Revenue:', topCustomers.length, 'customers found');

        res.status(200).json({
            success: true,
            data: topCustomers
        });

    } catch (error) {
        console.error('Error getting top customers by revenue:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while getting top customers by revenue',
            error: error.message
        });
    }
};

/**
 * Get Customer List with Details
 * Danh sách khách hàng chi tiết với pagination, search, filter
 */
const getCustomerList = async (req, res) => {
    try {
        const {
            startDate,
            endDate,
            page = 1,
            limit = 10,
            search = '',
            sortBy = 'totalSpent',
            sortOrder = 'desc',
            spendingLevel = 'all', // all, vip, high, medium, low
            status = 'all' // all, active, inactive
        } = req.query;

        // Build date filter
        const dateFilter = {};
        if (startDate) dateFilter.$gte = new Date(startDate);
        if (endDate) dateFilter.$lte = new Date(endDate);

        // Get BUYER role ID
        const buyerRole = await Role.findOne({ roleName: 'BUYER' });
        if (!buyerRole) {
            return res.status(404).json({
                success: false,
                message: 'Buyer role not found'
            });
        }

        // Build user filter for search
        const userFilter = { roleId: buyerRole._id };
        if (search) {
            userFilter.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phoneNumber: { $regex: search, $options: 'i' } }
            ];
        }

        // Get all buyers matching search
        const buyers = await User.find(userFilter).select('_id fullName email phoneNumber');
        const buyerIds = buyers.map(b => b._id);

        // Aggregate order data for these buyers
        const customerData = await Order.aggregate([
            {
                $match: {
                    'buyerInfo.userId': { $in: buyerIds },
                    ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {})
                }
            },
            {
                $group: {
                    _id: '$buyerInfo.userId',
                    totalOrders: { $sum: 1 },
                    totalSpent: {
                        $sum: {
                            $cond: [
                                { $in: ['$status', ['DELIVERED', 'COMPLETED']] },
                                '$finalAmount',
                                0
                            ]
                        }
                    },
                    completedOrders: {
                        $sum: {
                            $cond: [
                                { $in: ['$status', ['DELIVERED', 'COMPLETED']] },
                                1,
                                0
                            ]
                        }
                    },
                    lastOrderDate: { $max: '$createdAt' }
                }
            }
        ]);

        // Create a map for quick lookup
        const orderDataMap = new Map();
        customerData.forEach(data => {
            orderDataMap.set(data._id.toString(), data);
        });

        // Combine buyer info with order data
        let customers = buyers.map(buyer => {
            const orderData = orderDataMap.get(buyer._id.toString()) || {
                totalOrders: 0,
                totalSpent: 0,
                completedOrders: 0,
                lastOrderDate: null
            };

            const averageOrderValue = orderData.completedOrders > 0
                ? orderData.totalSpent / orderData.completedOrders
                : 0;

            // Determine spending level
            let spendingLevelValue = 'low';
            if (orderData.totalSpent >= 50000000) spendingLevelValue = 'vip';
            else if (orderData.totalSpent >= 20000000) spendingLevelValue = 'high';
            else if (orderData.totalSpent >= 5000000) spendingLevelValue = 'medium';

            return {
                _id: buyer._id,
                fullName: buyer.fullName,
                email: buyer.email,
                phoneNumber: buyer.phoneNumber,
                totalOrders: orderData.totalOrders,
                totalSpent: orderData.totalSpent,
                averageOrderValue: Math.round(averageOrderValue),
                lastOrderDate: orderData.lastOrderDate,
                status: orderData.totalOrders > 0 ? 'active' : 'inactive',
                spendingLevel: spendingLevelValue
            };
        });

        // Apply filters
        if (spendingLevel !== 'all') {
            customers = customers.filter(c => c.spendingLevel === spendingLevel);
        }
        if (status !== 'all') {
            customers = customers.filter(c => c.status === status);
        }

        // Sort
        const sortMultiplier = sortOrder === 'asc' ? 1 : -1;
        customers.sort((a, b) => {
            if (a[sortBy] < b[sortBy]) return -1 * sortMultiplier;
            if (a[sortBy] > b[sortBy]) return 1 * sortMultiplier;
            return 0;
        });

        // Pagination
        const total = customers.length;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedCustomers = customers.slice(startIndex, endIndex);

        res.status(200).json({
            success: true,
            data: paginatedCustomers,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error getting customer list:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while getting customer list',
            error: error.message
        });
    }
};

module.exports = {
    getCustomerOverview,
    getTopCustomersByOrders,
    getTopCustomersByRevenue,
    getCustomerList
};

