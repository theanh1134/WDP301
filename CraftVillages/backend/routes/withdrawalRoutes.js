const express = require('express');
const router = express.Router();
const {
    getAllWithdrawals,
    createWithdrawal,
    getWithdrawalById,
    getUserWithdrawals
} = require('../controllers/withdrawalController');

// GET /api/withdrawals - Lấy tất cả withdrawal records
router.get('/', getAllWithdrawals);

// POST /api/withdrawals - Tạo yêu cầu rút tiền mới
router.post('/', createWithdrawal);

// GET /api/withdrawals/user/:userId - Lấy lịch sử rút tiền của user
router.get('/user/:userId', getUserWithdrawals);

// GET /api/withdrawals/:id - Lấy withdrawal theo ID
router.get('/:id', getWithdrawalById);

module.exports = router;
