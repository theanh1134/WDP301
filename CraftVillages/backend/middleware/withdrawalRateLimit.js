const Withdrawal = require('../models/Withdrawal');

/**
 * Rate Limiting Middleware for Withdrawal Requests
 * Giới hạn số lần rút tiền mỗi ngày để tránh spam và gian lận
 */

const withdrawalRateLimit = async (req, res, next) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'userId is required'
            });
        }
        
        // Get start of today (00:00:00)
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        
        // Get end of today (23:59:59)
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        
        // Count withdrawals today
        const todayWithdrawalsCount = await Withdrawal.countDocuments({
            userId: userId,
            requestedAt: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });
        
        // Daily limit configuration
        const DAILY_LIMIT = process.env.WITHDRAWAL_DAILY_LIMIT || 5;
        
        console.log(`📊 Withdrawal rate check for user ${userId}:`);
        console.log(`   - Today's withdrawals: ${todayWithdrawalsCount}/${DAILY_LIMIT}`);
        
        if (todayWithdrawalsCount >= DAILY_LIMIT) {
            return res.status(429).json({
                success: false,
                message: `Bạn đã đạt giới hạn ${DAILY_LIMIT} lần rút tiền mỗi ngày. Vui lòng thử lại vào ngày mai.`,
                error: 'DAILY_LIMIT_EXCEEDED',
                data: {
                    currentCount: todayWithdrawalsCount,
                    limit: DAILY_LIMIT,
                    resetAt: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000) // Tomorrow 00:00
                }
            });
        }
        
        // Attach info to request for logging
        req.withdrawalRateInfo = {
            todayCount: todayWithdrawalsCount,
            limit: DAILY_LIMIT,
            remaining: DAILY_LIMIT - todayWithdrawalsCount
        };
        
        next();
        
    } catch (error) {
        console.error('❌ Error in withdrawal rate limit middleware:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi kiểm tra giới hạn rút tiền',
            error: error.message
        });
    }
};

/**
 * Check if user has pending withdrawals
 * Kiểm tra xem user có withdrawal đang chờ xử lý không
 */
const checkPendingWithdrawals = async (req, res, next) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return next();
        }
        
        // Count pending withdrawals
        const pendingCount = await Withdrawal.countDocuments({
            userId: userId,
            status: { $in: ['PENDING', 'PROCESSING'] }
        });
        
        // Optional: Limit concurrent pending withdrawals
        const MAX_PENDING = process.env.MAX_PENDING_WITHDRAWALS || 3;
        
        if (pendingCount >= MAX_PENDING) {
            return res.status(400).json({
                success: false,
                message: `Bạn có ${pendingCount} yêu cầu rút tiền đang chờ xử lý. Vui lòng đợi các yêu cầu này hoàn tất trước khi tạo yêu cầu mới.`,
                error: 'TOO_MANY_PENDING_WITHDRAWALS',
                data: {
                    pendingCount,
                    maxAllowed: MAX_PENDING
                }
            });
        }
        
        req.pendingWithdrawalsCount = pendingCount;
        
        next();
        
    } catch (error) {
        console.error('❌ Error checking pending withdrawals:', error);
        next(); // Don't block the request on error
    }
};

/**
 * Calculate available balance (excluding pending withdrawals)
 * Tính số dư khả dụng (trừ đi các withdrawal đang pending)
 */
const calculateAvailableBalance = async (userId, currentBalance) => {
    try {
        // Sum all pending withdrawal amounts (including fees)
        const pendingWithdrawals = await Withdrawal.aggregate([
            {
                $match: {
                    userId: userId,
                    status: { $in: ['PENDING', 'PROCESSING'] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$amount' },
                    totalFee: { $sum: '$feeInfo.withdrawalFee' }
                }
            }
        ]);
        
        const pendingTotal = pendingWithdrawals.length > 0 
            ? (pendingWithdrawals[0].totalAmount + pendingWithdrawals[0].totalFee)
            : 0;
        
        const availableBalance = currentBalance - pendingTotal;
        
        console.log(`💰 Balance calculation for user ${userId}:`);
        console.log(`   - Current balance: ${currentBalance.toLocaleString()} VND`);
        console.log(`   - Pending withdrawals: ${pendingTotal.toLocaleString()} VND`);
        console.log(`   - Available balance: ${availableBalance.toLocaleString()} VND`);
        
        return {
            currentBalance,
            pendingTotal,
            availableBalance
        };
        
    } catch (error) {
        console.error('❌ Error calculating available balance:', error);
        // On error, return current balance as available
        return {
            currentBalance,
            pendingTotal: 0,
            availableBalance: currentBalance
        };
    }
};

module.exports = {
    withdrawalRateLimit,
    checkPendingWithdrawals,
    calculateAvailableBalance
};

