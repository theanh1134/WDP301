const Order = require('../models/Order');
const SellerTransaction = require('../models/SellerTransaction');
const User = require('../models/User');
const Product = require('../models/Product');

/**
 * Get Revenue Overview
 * Tổng doanh thu hôm nay/tuần/tháng/năm
 */
const getRevenueOverview = async (req, res) => {
    try {
        const { period = 'month' } = req.query; // day, week, month, year

        const now = new Date();
        let startDate, previousStartDate, previousEndDate;

        // Calculate date ranges based on period
        switch (period) {
            case 'day':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                previousStartDate = new Date(startDate);
                previousStartDate.setDate(previousStartDate.getDate() - 1);
                previousEndDate = new Date(startDate);
                break;
            case 'week':
                const dayOfWeek = now.getDay();
                startDate = new Date(now);
                startDate.setDate(now.getDate() - dayOfWeek);
                startDate.setHours(0, 0, 0, 0);
                previousStartDate = new Date(startDate);
                previousStartDate.setDate(previousStartDate.getDate() - 7);
                previousEndDate = new Date(startDate);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                previousEndDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                previousStartDate = new Date(now.getFullYear() - 1, 0, 1);
                previousEndDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                previousEndDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        // Current period stats
        const currentStats = await SellerTransaction.aggregate([
            {
                $match: {
                    transactionType: 'ORDER_PAYMENT',
                    status: 'COMPLETED',
                    createdAt: { $gte: startDate, $lte: now }
                }
            },
            {
                $group: {
                    _id: null,
                    totalCommission: { $sum: '$amounts.platformFee' },
                    totalGMV: { $sum: '$amounts.grossAmount' },
                    totalOrders: { $sum: 1 }
                }
            }
        ]);

        // Previous period stats
        const previousStats = await SellerTransaction.aggregate([
            {
                $match: {
                    transactionType: 'ORDER_PAYMENT',
                    status: 'COMPLETED',
                    createdAt: { $gte: previousStartDate, $lt: previousEndDate }
                }
            },
            {
                $group: {
                    _id: null,
                    totalCommission: { $sum: '$amounts.platformFee' },
                    totalGMV: { $sum: '$amounts.grossAmount' },
                    totalOrders: { $sum: 1 }
                }
            }
        ]);

        const current = currentStats[0] || { totalCommission: 0, totalGMV: 0, totalOrders: 0 };
        const previous = previousStats[0] || { totalCommission: 0, totalGMV: 0, totalOrders: 0 };

        // Calculate percentage changes
        const revenueChange = previous.totalCommission > 0
            ? ((current.totalCommission - previous.totalCommission) / previous.totalCommission * 100).toFixed(1)
            : 0;

        const ordersChange = previous.totalOrders > 0
            ? ((current.totalOrders - previous.totalOrders) / previous.totalOrders * 100).toFixed(1)
            : 0;

        const gmvChange = previous.totalGMV > 0
            ? ((current.totalGMV - previous.totalGMV) / previous.totalGMV * 100).toFixed(1)
            : 0;

        // Get total sellers and customers
        const totalSellers = await User.countDocuments({
            roleId: { $exists: true },
            isActive: true
        }).populate('roleId').then(async () => {
            const Role = require('../models/Role');
            const sellerRole = await Role.findOne({ roleName: 'SELLER' });
            return User.countDocuments({ roleId: sellerRole._id, isActive: true });
        });

        const totalCustomers = await User.countDocuments({
            roleId: { $exists: true },
            isActive: true
        }).populate('roleId').then(async () => {
            const Role = require('../models/Role');
            const buyerRole = await Role.findOne({ roleName: 'BUYER' });
            return User.countDocuments({ roleId: buyerRole._id, isActive: true });
        });

        res.json({
            success: true,
            data: {
                period,
                current: {
                    totalRevenue: current.totalCommission,
                    totalGMV: current.totalGMV,
                    totalOrders: current.totalOrders,
                    totalSellers,
                    totalCustomers
                },
                previous: {
                    totalRevenue: previous.totalCommission,
                    totalGMV: previous.totalGMV,
                    totalOrders: previous.totalOrders
                },
                changes: {
                    revenueChange: parseFloat(revenueChange),
                    ordersChange: parseFloat(ordersChange),
                    gmvChange: parseFloat(gmvChange)
                }
            }
        });

    } catch (error) {
        console.error('Error getting revenue overview:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get revenue overview',
            error: error.message
        });
    }
};

/**
 * Get Revenue Chart Data
 * Biểu đồ doanh thu theo thời gian
 */
const getRevenueChart = async (req, res) => {
    try {
        const { period = 'month', year } = req.query;

        const currentYear = year ? parseInt(year) : new Date().getFullYear();
        let groupBy, labels;

        if (period === 'year') {
            // Group by month for yearly view
            groupBy = {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
            };
            labels = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
        } else {
            // Group by day for monthly view
            groupBy = {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
                day: { $dayOfMonth: '$createdAt' }
            };
            const daysInMonth = new Date(currentYear, new Date().getMonth() + 1, 0).getDate();
            labels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`);
        }

        const startDate = period === 'year'
            ? new Date(currentYear, 0, 1)
            : new Date(currentYear, new Date().getMonth(), 1);

        const endDate = period === 'year'
            ? new Date(currentYear, 11, 31, 23, 59, 59)
            : new Date(currentYear, new Date().getMonth() + 1, 0, 23, 59, 59);

        const chartData = await SellerTransaction.aggregate([
            {
                $match: {
                    transactionType: 'ORDER_PAYMENT',
                    status: 'COMPLETED',
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: groupBy,
                    totalRevenue: { $sum: '$amounts.platformFee' },
                    totalGMV: { $sum: '$amounts.grossAmount' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
            }
        ]);

        // Format data for chart
        const revenueData = new Array(labels.length).fill(0);
        const gmvData = new Array(labels.length).fill(0);

        chartData.forEach(item => {
            const index = period === 'year'
                ? item._id.month - 1
                : item._id.day - 1;

            if (index >= 0 && index < labels.length) {
                revenueData[index] = Math.round(item.totalRevenue / 1000000 * 100) / 100; // Convert to millions
                gmvData[index] = Math.round(item.totalGMV / 1000000 * 100) / 100;
            }
        });

        res.json({
            success: true,
            data: {
                labels,
                datasets: [
                    {
                        label: 'GMV (triệu VND)',
                        data: gmvData
                    },
                    {
                        label: 'Hoa hồng (triệu VND)',
                        data: revenueData
                    }
                ]
            }
        });

    } catch (error) {
        console.error('Error getting revenue chart:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get revenue chart',
            error: error.message
        });
    }
};

/**
 * Get Revenue by Category
 * Doanh thu theo danh mục sản phẩm
 */
const getRevenueByCategory = async (req, res) => {
    try {
        const { period = 'month' } = req.query;

        const now = new Date();
        let startDate;

        switch (period) {
            case 'day':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'week':
                const dayOfWeek = now.getDay();
                startDate = new Date(now);
                startDate.setDate(now.getDate() - dayOfWeek);
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        const categoryData = await Order.aggregate([
            {
                $match: {
                    status: 'DELIVERED',
                    createdAt: { $gte: startDate, $lte: now }
                }
            },
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.productId',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: '$product.category',
                    totalRevenue: { $sum: { $multiply: ['$items.priceAtPurchase', '$items.quantity', 0.05] } },
                    totalOrders: { $sum: 1 }
                }
            },
            { $sort: { totalRevenue: -1 } }
        ]);

        const labels = categoryData.map(item => item._id || 'Khác');
        const data = categoryData.map(item => Math.round(item.totalRevenue / 1000000 * 100) / 100);

        res.json({
            success: true,
            data: {
                labels,
                data
            }
        });

    } catch (error) {
        console.error('Error getting revenue by category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get revenue by category',
            error: error.message
        });
    }
};

/**
 * Get Top Sellers
 * Top sellers theo doanh thu
 */
const getTopSellers = async (req, res) => {
    try {
        const { limit = 5, period = 'month' } = req.query;

        const now = new Date();
        let startDate;

        switch (period) {
            case 'day':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'week':
                const dayOfWeek = now.getDay();
                startDate = new Date(now);
                startDate.setDate(now.getDate() - dayOfWeek);
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        const topSellers = await SellerTransaction.aggregate([
            {
                $match: {
                    transactionType: 'ORDER_PAYMENT',
                    status: 'COMPLETED',
                    createdAt: { $gte: startDate, $lte: now }
                }
            },
            {
                $group: {
                    _id: '$sellerId',
                    totalRevenue: { $sum: '$amounts.platformFee' },
                    totalGMV: { $sum: '$amounts.grossAmount' },
                    totalOrders: { $sum: 1 }
                }
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: parseInt(limit) },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'seller'
                }
            },
            { $unwind: '$seller' },
            {
                $lookup: {
                    from: 'shops',
                    localField: '_id',
                    foreignField: 'ownerId',
                    as: 'shop'
                }
            },
            { $unwind: { path: '$shop', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    sellerName: '$seller.fullName',
                    shopName: '$shop.shopName',
                    totalRevenue: 1,
                    totalGMV: 1,
                    totalOrders: 1
                }
            }
        ]);

        const labels = topSellers.map(seller => seller.shopName || seller.sellerName);
        const data = topSellers.map(seller => Math.round(seller.totalRevenue / 1000000 * 100) / 100);

        res.json({
            success: true,
            data: {
                labels,
                data,
                details: topSellers
            }
        });

    } catch (error) {
        console.error('Error getting top sellers:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get top sellers',
            error: error.message
        });
    }
};

/**
 * Get Commission Analytics
 * Phân tích hoa hồng chi tiết
 */
const getCommissionAnalytics = async (req, res) => {
    try {
        const { period = 'month' } = req.query;

        const now = new Date();
        let startDate;

        switch (period) {
            case 'day':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'week':
                const dayOfWeek = now.getDay();
                startDate = new Date(now);
                startDate.setDate(now.getDate() - dayOfWeek);
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        // Get commission stats
        const commissionStats = await SellerTransaction.aggregate([
            {
                $match: {
                    transactionType: 'ORDER_PAYMENT',
                    status: 'COMPLETED',
                    createdAt: { $gte: startDate, $lte: now }
                }
            },
            {
                $group: {
                    _id: null,
                    totalCommission: { $sum: '$amounts.platformFee' },
                    totalOrders: { $sum: 1 },
                    avgCommissionRate: { $avg: '$amounts.platformFeeRate' }
                }
            }
        ]);

        // Count unique sellers
        const uniqueSellers = await SellerTransaction.distinct('sellerId', {
            transactionType: 'ORDER_PAYMENT',
            status: 'COMPLETED',
            createdAt: { $gte: startDate, $lte: now }
        });

        const stats = commissionStats[0] || {
            totalCommission: 0,
            totalOrders: 0,
            avgCommissionRate: 5.0
        };

        res.json({
            success: true,
            data: {
                avgCommissionRate: stats.avgCommissionRate || 5.0,
                totalCommission: Math.round(stats.totalCommission),
                totalSellers: uniqueSellers.length,
                totalOrders: stats.totalOrders
            }
        });

    } catch (error) {
        console.error('Error getting commission analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get commission analytics',
            error: error.message
        });
    }
};

/**
 * Get Commission by Seller
 * Hoa hồng theo từng seller
 */
const getCommissionBySeller = async (req, res) => {
    try {
        const { limit = 5, period = 'month' } = req.query;

        const now = new Date();
        let startDate;

        switch (period) {
            case 'day':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'week':
                const dayOfWeek = now.getDay();
                startDate = new Date(now);
                startDate.setDate(now.getDate() - dayOfWeek);
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        const sellerCommission = await SellerTransaction.aggregate([
            {
                $match: {
                    transactionType: 'ORDER_PAYMENT',
                    status: 'COMPLETED',
                    createdAt: { $gte: startDate, $lte: now }
                }
            },
            {
                $group: {
                    _id: '$sellerId',
                    totalCommission: { $sum: '$amounts.platformFee' },
                    totalOrders: { $sum: 1 },
                    avgRate: { $avg: '$amounts.platformFeeRate' }
                }
            },
            { $sort: { totalCommission: -1 } },
            { $limit: parseInt(limit) },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'seller'
                }
            },
            { $unwind: { path: '$seller', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'shops',
                    localField: 'seller._id',
                    foreignField: 'userId',
                    as: 'shop'
                }
            },
            { $unwind: { path: '$shop', preserveNullAndEmptyArrays: true } }
        ]);

        const labels = sellerCommission.map(item => item.shop?.shopName || item.seller?.fullName || 'Unknown');
        const data = sellerCommission.map(item => Math.round(item.totalCommission / 1000000 * 100) / 100);

        const details = sellerCommission.map((item, index) => ({
            id: item._id,
            name: item.seller?.fullName || 'Unknown',
            shop: item.shop?.shopName || 'No Shop',
            commission: Math.round(item.totalCommission),
            rate: item.avgRate || 5.0,
            orders: item.totalOrders
        }));

        res.json({
            success: true,
            data: {
                labels,
                data,
                details
            }
        });

    } catch (error) {
        console.error('Error getting commission by seller:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get commission by seller',
            error: error.message
        });
    }
};


/**
 * Get Commission by Region
 * Hoa hồng theo khu vực địa lý
 */
const getCommissionByRegion = async (req, res) => {
    try {
        const { period = 'month' } = req.query;

        const now = new Date();
        let startDate;

        switch (period) {
            case 'day':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'week':
                const dayOfWeek = now.getDay();
                startDate = new Date(now);
                startDate.setDate(now.getDate() - dayOfWeek);
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        const regionCommission = await SellerTransaction.aggregate([
            {
                $match: {
                    transactionType: 'ORDER_PAYMENT',
                    status: 'COMPLETED',
                    createdAt: { $gte: startDate, $lte: now }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'sellerId',
                    foreignField: '_id',
                    as: 'seller'
                }
            },
            { $unwind: { path: '$seller', preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    city: {
                        $cond: {
                            if: { $gt: [{ $size: { $ifNull: ['$seller.addresses', []] } }, 0] },
                            then: { $arrayElemAt: ['$seller.addresses.city', 0] },
                            else: 'Không xác định'
                        }
                    }
                }
            },
            {
                $group: {
                    _id: '$city',
                    totalCommission: { $sum: '$amounts.platformFee' },
                    totalOrders: { $sum: 1 }
                }
            },
            { $sort: { totalCommission: -1 } },
            { $limit: 10 }
        ]);

        const labels = regionCommission.map(item => item._id || 'Không xác định');
        const data = regionCommission.map(item => Math.round(item.totalCommission / 1000000 * 100) / 100);

        res.json({
            success: true,
            data: {
                labels,
                data
            }
        });

    } catch (error) {
        console.error('Error getting commission by region:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get commission by region',
            error: error.message
        });
    }
};

/**
 * Get Commission History
 * Lịch sử hoa hồng theo tháng (12 tháng gần nhất)
 */
const getCommissionHistory = async (req, res) => {
    try {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);

        const commissionHistory = await SellerTransaction.aggregate([
            {
                $match: {
                    transactionType: 'ORDER_PAYMENT',
                    status: 'COMPLETED',
                    createdAt: { $gte: startDate, $lte: now }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    totalCommission: { $sum: '$amounts.platformFee' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        const labels = [];
        const data = [];

        for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;

            const found = commissionHistory.find(item =>
                item._id.year === year && item._id.month === month
            );

            labels.push(`T${month}`);
            data.push(found ? Math.round(found.totalCommission / 1000000 * 100) / 100 : 0);
        }

        res.json({
            success: true,
            data: {
                labels,
                data
            }
        });

    } catch (error) {
        console.error('Error getting commission history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get commission history',
            error: error.message
        });
    }
};





module.exports = {
    getRevenueOverview,
    getRevenueChart,
    getRevenueByCategory,
    getTopSellers,
    getCommissionAnalytics,
    getCommissionBySeller,
    getCommissionByRegion,
    getCommissionHistory
};
