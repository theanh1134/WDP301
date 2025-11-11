const SellerTransaction = require('../models/SellerTransaction');
const User = require('../models/User');

/**
 * Get seller's transaction history
 */
const getSellerTransactions = async (req, res) => {
    try {
        const { sellerId } = req.params;
        const { 
            transactionType, 
            status, 
            limit = 50, 
            skip = 0, 
            sortBy = 'createdAt', 
            sortOrder = -1 
        } = req.query;
        
        // Verify seller exists
        const seller = await User.findById(sellerId);
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: 'Seller not found'
            });
        }
        
        const transactions = await SellerTransaction.getSellerHistory(sellerId, {
            transactionType,
            status,
            limit: parseInt(limit),
            skip: parseInt(skip),
            sortBy,
            sortOrder: parseInt(sortOrder)
        });
        
        // Get total count
        const query = { sellerId };
        if (transactionType) query.transactionType = transactionType;
        if (status) query.status = status;
        const totalCount = await SellerTransaction.countDocuments(query);
        
        res.json({
            success: true,
            data: transactions,
            pagination: {
                total: totalCount,
                limit: parseInt(limit),
                skip: parseInt(skip),
                hasMore: (parseInt(skip) + transactions.length) < totalCount
            }
        });
    } catch (error) {
        console.error('Error getting seller transactions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get seller transactions',
            error: error.message
        });
    }
};

/**
 * Get single transaction details
 */
const getTransaction = async (req, res) => {
    try {
        const { transactionId } = req.params;
        
        const transaction = await SellerTransaction.findById(transactionId)
            .populate('sellerId', 'fullName email balance')
            .populate('shopId', 'shopName')
            .populate('orderId', 'orderNumber finalAmount status')
            .populate('returnId', 'rmaCode status')
            .populate('withdrawalId', 'withdrawalCode amount')
            .populate('processedBy', 'fullName email');
        
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }
        
        res.json({
            success: true,
            data: transaction
        });
    } catch (error) {
        console.error('Error getting transaction:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get transaction',
            error: error.message
        });
    }
};

/**
 * Get seller's transaction summary/statistics
 */
const getSellerTransactionSummary = async (req, res) => {
    try {
        const { sellerId } = req.params;
        const { startDate, endDate } = req.query;
        
        // Verify seller exists
        const seller = await User.findById(sellerId);
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: 'Seller not found'
            });
        }
        
        // Build date filter
        const dateFilter = {};
        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
            if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
        }
        
        // Get transaction statistics
        const [
            totalOrderPayments,
            totalRefundDeductions,
            totalWithdrawals,
            totalTransactions,
            recentTransactions
        ] = await Promise.all([
            // Total order payments
            SellerTransaction.aggregate([
                { 
                    $match: { 
                        sellerId: seller._id, 
                        transactionType: 'ORDER_PAYMENT',
                        status: 'COMPLETED',
                        ...dateFilter
                    } 
                },
                { 
                    $group: { 
                        _id: null, 
                        totalGross: { $sum: '$amounts.grossAmount' },
                        totalFee: { $sum: '$amounts.platformFee' },
                        totalNet: { $sum: '$amounts.netAmount' },
                        count: { $sum: 1 }
                    } 
                }
            ]),
            
            // Total refund deductions
            SellerTransaction.aggregate([
                { 
                    $match: { 
                        sellerId: seller._id, 
                        transactionType: 'REFUND_DEDUCTION',
                        status: 'COMPLETED',
                        ...dateFilter
                    } 
                },
                { 
                    $group: { 
                        _id: null, 
                        totalAmount: { $sum: { $abs: '$amounts.netAmount' } },
                        count: { $sum: 1 }
                    } 
                }
            ]),
            
            // Total withdrawals
            SellerTransaction.aggregate([
                { 
                    $match: { 
                        sellerId: seller._id, 
                        transactionType: 'WITHDRAWAL',
                        status: 'COMPLETED',
                        ...dateFilter
                    } 
                },
                { 
                    $group: { 
                        _id: null, 
                        totalAmount: { $sum: { $abs: '$amounts.netAmount' } },
                        count: { $sum: 1 }
                    } 
                }
            ]),
            
            // Total transactions count
            SellerTransaction.countDocuments({ sellerId: seller._id, ...dateFilter }),
            
            // Recent transactions
            SellerTransaction.find({ sellerId: seller._id, ...dateFilter })
                .sort({ createdAt: -1 })
                .limit(10)
                .populate('orderId', 'orderNumber')
        ]);
        
        const summary = {
            sellerId: seller._id,
            sellerName: seller.fullName,
            currentBalance: seller.getBalance(),
            formattedBalance: `${seller.getBalance().toLocaleString()} VND`,
            
            orderPayments: {
                totalGross: totalOrderPayments[0]?.totalGross || 0,
                totalPlatformFee: totalOrderPayments[0]?.totalFee || 0,
                totalNet: totalOrderPayments[0]?.totalNet || 0,
                count: totalOrderPayments[0]?.count || 0,
                formattedGross: `${(totalOrderPayments[0]?.totalGross || 0).toLocaleString()} VND`,
                formattedFee: `${(totalOrderPayments[0]?.totalFee || 0).toLocaleString()} VND`,
                formattedNet: `${(totalOrderPayments[0]?.totalNet || 0).toLocaleString()} VND`
            },
            
            refundDeductions: {
                totalAmount: totalRefundDeductions[0]?.totalAmount || 0,
                count: totalRefundDeductions[0]?.count || 0,
                formattedAmount: `${(totalRefundDeductions[0]?.totalAmount || 0).toLocaleString()} VND`
            },
            
            withdrawals: {
                totalAmount: totalWithdrawals[0]?.totalAmount || 0,
                count: totalWithdrawals[0]?.count || 0,
                formattedAmount: `${(totalWithdrawals[0]?.totalAmount || 0).toLocaleString()} VND`
            },
            
            totalTransactions: totalTransactions,
            recentTransactions: recentTransactions
        };
        
        res.json({
            success: true,
            data: summary
        });
    } catch (error) {
        console.error('Error getting seller transaction summary:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get seller transaction summary',
            error: error.message
        });
    }
};

/**
 * Manual process order payment (admin only)
 */
const manualProcessOrderPayment = async (req, res) => {
    try {
        const { orderId } = req.body;
        
        const SellerPaymentService = require('../services/sellerPaymentService');
        const result = await SellerPaymentService.processOrderPayment(orderId);
        
        if (result.success) {
            res.json({
                success: true,
                message: 'Order payment processed successfully',
                data: result.data
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.message,
                data: result
            });
        }
    } catch (error) {
        console.error('Error processing order payment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process order payment',
            error: error.message
        });
    }
};

/**
 * Get all transactions (admin only)
 */
const getAllTransactions = async (req, res) => {
    try {
        const { 
            transactionType, 
            status, 
            limit = 50, 
            skip = 0, 
            sortBy = 'createdAt', 
            sortOrder = -1 
        } = req.query;
        
        const query = {};
        if (transactionType) query.transactionType = transactionType;
        if (status) query.status = status;
        
        const sortObj = {};
        sortObj[sortBy] = parseInt(sortOrder);
        
        const transactions = await SellerTransaction.find(query)
            .sort(sortObj)
            .limit(parseInt(limit))
            .skip(parseInt(skip))
            .populate('sellerId', 'fullName email')
            .populate('shopId', 'shopName')
            .populate('orderId', 'orderNumber finalAmount');
        
        const totalCount = await SellerTransaction.countDocuments(query);
        
        res.json({
            success: true,
            data: transactions,
            pagination: {
                total: totalCount,
                limit: parseInt(limit),
                skip: parseInt(skip),
                hasMore: (parseInt(skip) + transactions.length) < totalCount
            }
        });
    } catch (error) {
        console.error('Error getting all transactions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get transactions',
            error: error.message
        });
    }
};

/**
 * Get current seller's own transactions (authenticated seller)
 */
const getMyTransactions = async (req, res) => {
    try {
        console.log('🔍 getMyTransactions called, user:', req.user?._id);
        const sellerId = req.user._id; // Get from authenticated user
        const {
            transactionType,
            status,
            page = 1,
            limit = 20,
            startDate,
            endDate,
            sortBy = 'createdAt',
            sortOrder = -1
        } = req.query;

        // Build query
        const query = { sellerId };
        if (transactionType) query.transactionType = transactionType;
        if (status) query.status = status;

        // Date filter
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        // Calculate skip
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build sort object
        const sortObj = {};
        sortObj[sortBy] = parseInt(sortOrder);

        // Get transactions
        const transactions = await SellerTransaction.find(query)
            .sort(sortObj)
            .limit(parseInt(limit))
            .skip(skip)
            .populate('shopId', 'shopName')
            .populate('orderId', 'orderNumber finalAmount status createdAt')
            .populate('returnId', 'rmaCode status')
            .populate('withdrawalId', 'withdrawalCode amount');

        // Get total count
        const totalCount = await SellerTransaction.countDocuments(query);

        // Get current balance
        const seller = await User.findById(sellerId);

        res.json({
            success: true,
            data: {
                transactions,
                currentBalance: seller.getBalance(),
                formattedBalance: `${seller.getBalance().toLocaleString()} VND`
            },
            pagination: {
                total: totalCount,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(totalCount / parseInt(limit)),
                hasMore: (skip + transactions.length) < totalCount
            }
        });
    } catch (error) {
        console.error('Error getting my transactions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get transactions',
            error: error.message
        });
    }
};

/**
 * Get current seller's transaction summary
 */
const getMySummary = async (req, res) => {
    try {
        const sellerId = req.user._id;
        const { startDate, endDate } = req.query;

        // Build date filter
        const dateFilter = {};
        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
            if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
        }

        // Get seller
        const seller = await User.findById(sellerId);

        // Get transaction statistics
        const [
            totalOrderPayments,
            totalRefundDeductions,
            totalWithdrawals
        ] = await Promise.all([
            // Total order payments
            SellerTransaction.aggregate([
                {
                    $match: {
                        sellerId: seller._id,
                        transactionType: 'ORDER_PAYMENT',
                        status: 'COMPLETED',
                        ...dateFilter
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalGross: { $sum: '$amounts.grossAmount' },
                        totalFee: { $sum: '$amounts.platformFee' },
                        totalNet: { $sum: '$amounts.netAmount' },
                        count: { $sum: 1 }
                    }
                }
            ]),

            // Total refund deductions
            SellerTransaction.aggregate([
                {
                    $match: {
                        sellerId: seller._id,
                        transactionType: 'REFUND_DEDUCTION',
                        status: 'COMPLETED',
                        ...dateFilter
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: { $abs: '$amounts.netAmount' } },
                        count: { $sum: 1 }
                    }
                }
            ]),

            // Total withdrawals
            SellerTransaction.aggregate([
                {
                    $match: {
                        sellerId: seller._id,
                        transactionType: 'WITHDRAWAL',
                        status: 'COMPLETED',
                        ...dateFilter
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: { $abs: '$amounts.netAmount' } },
                        count: { $sum: 1 }
                    }
                }
            ])
        ]);

        const summary = {
            currentBalance: seller.getBalance(),
            formattedBalance: `${seller.getBalance().toLocaleString()} VND`,

            orderPayments: {
                totalGross: totalOrderPayments[0]?.totalGross || 0,
                totalPlatformFee: totalOrderPayments[0]?.totalFee || 0,
                totalNet: totalOrderPayments[0]?.totalNet || 0,
                count: totalOrderPayments[0]?.count || 0
            },

            refundDeductions: {
                totalAmount: totalRefundDeductions[0]?.totalAmount || 0,
                count: totalRefundDeductions[0]?.count || 0
            },

            withdrawals: {
                totalAmount: totalWithdrawals[0]?.totalAmount || 0,
                count: totalWithdrawals[0]?.count || 0
            }
        };

        res.json({
            success: true,
            data: summary
        });
    } catch (error) {
        console.error('Error getting my summary:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get summary',
            error: error.message
        });
    }
};

module.exports = {
    getSellerTransactions,
    getTransaction,
    getSellerTransactionSummary,
    manualProcessOrderPayment,
    getAllTransactions,
    getMyTransactions,
    getMySummary
};

