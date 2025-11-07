const express = require('express');
const router = express.Router();
const {
    getAllWithdrawals,
    createWithdrawal,
    getWithdrawalById,
    getUserWithdrawals
} = require('../controllers/withdrawalController');

// Import rate limiting middleware
const {
    withdrawalRateLimit,
    checkPendingWithdrawals
} = require('../middleware/withdrawalRateLimit');

/**
 * WITHDRAWAL ROUTES
 *
 * Security improvements:
 * - Rate limiting: Max 5 withdrawals per day
 * - Pending check: Max 3 pending withdrawals at a time
 * - Transaction support: Prevent race conditions
 */

// GET /api/withdrawals - Lấy tất cả withdrawal records
router.get('/', getAllWithdrawals);

// POST /api/withdrawals - Tạo yêu cầu rút tiền mới
// Apply rate limiting and pending check middleware
router.post('/',
    withdrawalRateLimit,      // Check daily limit
    checkPendingWithdrawals,  // Check pending withdrawals
    createWithdrawal          // Create withdrawal
);

// GET /api/withdrawals/user/:userId - Lấy lịch sử rút tiền của user
router.get('/user/:userId', getUserWithdrawals);

// GET /api/withdrawals/:id - Lấy withdrawal theo ID
router.get('/:id', getWithdrawalById);

module.exports = router;
