const Withdrawal = require('../models/Withdrawal');
const User = require('../models/User');
const WithdrawalFeeConfig = require('../models/WithdrawalFeeConfig');
const { calculateAvailableBalance } = require('../middleware/withdrawalRateLimit');
const mongoose = require('mongoose');

/**
 * Lấy tất cả withdrawal từ database
 * GET /api/withdrawals
 */
const getAllWithdrawals = async (req, res) => {
    try {
        const { 
            status, 
            userId, 
            page = 1, 
            limit = 20,
            sortBy = 'requestedAt',
            sortOrder = -1 
        } = req.query;

        // Build filter
        const filter = {};
        if (status) filter.status = status;
        if (userId) filter.userId = userId;

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Build sort object
        const sortObj = {};
        sortObj[sortBy] = parseInt(sortOrder);

        // Get withdrawals with pagination
        const withdrawals = await Withdrawal.find(filter)
            .populate('userId', 'fullName email phoneNumber')
            .populate('processingInfo.processedBy', 'fullName email')
            .sort(sortObj)
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const total = await Withdrawal.countDocuments(filter);

        res.status(200).json({
            success: true,
            message: `Tìm thấy ${withdrawals.length} bản ghi rút tiền`,
            data: withdrawals,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit)),
                hasNext: page < Math.ceil(total / parseInt(limit)),
                hasPrev: page > 1
            }
        });

        console.log(`✅ API: Đã lấy ${withdrawals.length}/${total} bản ghi rút tiền`);
    } catch (error) {
        console.error('❌ Error fetching withdrawals:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể lấy danh sách rút tiền',
            error: error.message
        });
    }
};

/**
 * Tạo yêu cầu rút tiền mới
 * POST /api/withdrawals
 *
 * IMPROVEMENTS:
 * - MongoDB transaction để tránh race condition
 * - Tính phí động từ WithdrawalFeeConfig
 * - Kiểm tra available balance (trừ pending withdrawals)
 * - Validate số dư tối thiểu phải giữ lại
 * - Better error handling và logging
 */
const createWithdrawal = async (req, res) => {
    // Note: Transactions disabled for standalone MongoDB
    // For production, use MongoDB replica set and uncomment transaction code

    try {

        const {
            userId,
            amount,
            bankInfo,
            withdrawalFee // Optional: frontend có thể gửi lên, hoặc backend tự tính
        } = req.body;

        console.log('🔄 Đang tạo yêu cầu rút tiền:', {
            userId,
            amount: typeof amount === 'number' ? amount.toLocaleString() : amount,
            bankName: bankInfo?.bankName,
            accountNumber: bankInfo?.accountNumber,
            withdrawalFee
        });

        // ========== VALIDATION ==========

        // 1. Validate required fields
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'userId là bắt buộc'
            });
        }

        if (!amount) {
            return res.status(400).json({
                success: false,
                message: 'Số tiền là bắt buộc'
            });
        }

        if (!bankInfo) {
            return res.status(400).json({
                success: false,
                message: 'Thông tin ngân hàng là bắt buộc'
            });
        }

        // 2. Validate amount
        if (typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Số tiền phải là số dương'
            });
        }

        if (amount < 1000) {
            return res.status(400).json({
                success: false,
                message: 'Số tiền rút tối thiểu là 1.000 VNĐ'
            });
        }

        if (amount > 50000000) {
            return res.status(400).json({
                success: false,
                message: 'Số tiền rút tối đa là 50.000.000 VNĐ mỗi giao dịch'
            });
        }

        // 3. Validate bankInfo structure
        const requiredBankFields = ['bankName', 'accountNumber', 'accountHolderName'];
        const missingFields = [];

        for (const field of requiredBankFields) {
            if (!bankInfo[field] || bankInfo[field].toString().trim() === '') {
                missingFields.push(field);
            }
        }

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Thiếu thông tin ngân hàng bắt buộc: ${missingFields.join(', ')}`
            });
        }

        // 4. Validate account number format (6-20 digits)
        const accountNumberRegex = /^[0-9]{6,20}$/;
        if (!accountNumberRegex.test(bankInfo.accountNumber)) {
            return res.status(400).json({
                success: false,
                message: 'Số tài khoản chỉ được chứa số và có độ dài 6-20 ký tự'
            });
        }

        // ========== BUSINESS LOGIC ==========

        // 1. Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        // 2. Calculate withdrawal fee dynamically
        const userTier = user.tier || 'NORMAL'; // Assuming user has tier field
        const calculatedFee = await WithdrawalFeeConfig.calculateFee(amount, userTier);

        // Use calculated fee if not provided by frontend
        const finalWithdrawalFee = withdrawalFee !== undefined ? withdrawalFee : calculatedFee;

        console.log('💰 Phí rút tiền:', {
            userTier,
            calculatedFee: calculatedFee.toLocaleString(),
            providedFee: withdrawalFee !== undefined ? withdrawalFee.toLocaleString() : 'N/A',
            finalFee: finalWithdrawalFee.toLocaleString()
        });

        // 3. Calculate available balance (excluding pending withdrawals)
        const currentBalance = user.getBalance();
        const balanceInfo = await calculateAvailableBalance(userId, currentBalance);

        // 4. Calculate total deduction
        const totalDeduction = amount + finalWithdrawalFee;

        console.log('💳 Kiểm tra số dư:', {
            currentBalance: currentBalance.toLocaleString(),
            pendingWithdrawals: balanceInfo.pendingTotal.toLocaleString(),
            availableBalance: balanceInfo.availableBalance.toLocaleString(),
            requestedAmount: amount.toLocaleString(),
            withdrawalFee: finalWithdrawalFee.toLocaleString(),
            totalRequired: totalDeduction.toLocaleString()
        });

        // 5. Check available balance
        if (balanceInfo.availableBalance < totalDeduction) {
            return res.status(400).json({
                success: false,
                message: 'Số dư khả dụng không đủ',
                error: 'INSUFFICIENT_AVAILABLE_BALANCE',
                details: {
                    currentBalance: currentBalance,
                    pendingWithdrawals: balanceInfo.pendingTotal,
                    availableBalance: balanceInfo.availableBalance,
                    requestedAmount: amount,
                    withdrawalFee: finalWithdrawalFee,
                    totalRequired: totalDeduction,
                    shortfall: totalDeduction - balanceInfo.availableBalance
                }
            });
        }

        // 6. Check minimum balance requirement (optional: keep at least 10,000 VND)
        const MIN_BALANCE_REQUIRED = process.env.MIN_BALANCE_REQUIRED || 0;
        const balanceAfterWithdrawal = currentBalance - totalDeduction;

        if (balanceAfterWithdrawal < MIN_BALANCE_REQUIRED) {
            return res.status(400).json({
                success: false,
                message: `Bạn phải giữ lại tối thiểu ${MIN_BALANCE_REQUIRED.toLocaleString()} VNĐ trong tài khoản`,
                error: 'MINIMUM_BALANCE_REQUIRED',
                details: {
                    currentBalance,
                    totalDeduction,
                    balanceAfterWithdrawal,
                    minimumRequired: MIN_BALANCE_REQUIRED
                }
            });
        }

        // ========== CREATE WITHDRAWAL ==========

        // 1. Create withdrawal document (withdrawalCode sẽ được auto-generate, status = SUCCESS)
        const withdrawalData = {
            userId,
            amount,
            bankInfo: {
                bankName: bankInfo.bankName.trim(),
                accountNumber: bankInfo.accountNumber.trim(),
                accountHolderName: bankInfo.accountHolderName.trim().toUpperCase(), // Uppercase for consistency
                branchName: bankInfo.branchName ? bankInfo.branchName.trim() : ''
            },
            balanceSnapshot: {
                beforeWithdrawal: currentBalance,
                afterWithdrawal: currentBalance - totalDeduction
            },
            status: 'SUCCESS', // Auto-approve theo yêu cầu
            processedAt: new Date(),
            completedAt: new Date()
        };

        // Add fee info
        if (finalWithdrawalFee > 0) {
            withdrawalData.feeInfo = {
                withdrawalFee: finalWithdrawalFee,
                netAmount: amount // Net amount user receives (amount requested)
            };
        }

        const withdrawal = new Withdrawal(withdrawalData);

        // 2. Save withdrawal (validate sẽ chạy và auto-generate withdrawalCode)
        await withdrawal.save();

        // 3. Deduct from user balance
        await user.subtractBalance(
            totalDeduction,
            `Withdrawal request ${withdrawal.withdrawalCode}`
        );

        console.log('✅ Withdrawal saved successfully');

        // 4. Populate user info for response
        await withdrawal.populate('userId', 'fullName email phoneNumber');

        // ========== RESPONSE ==========

        res.status(201).json({
            success: true,
            message: 'Rút tiền thành công',
            data: {
                _id: withdrawal._id,
                withdrawalCode: withdrawal.withdrawalCode,
                userId: withdrawal.userId._id,
                amount: withdrawal.amount,
                formattedAmount: withdrawal.formattedAmount,
                status: withdrawal.status,
                bankInfo: withdrawal.getFormattedBankInfo(),
                balanceSnapshot: withdrawal.balanceSnapshot,
                feeInfo: withdrawal.feeInfo,
                totalDeducted: withdrawal.getTotalDeductedAmount(),
                requestedAt: withdrawal.requestedAt,
                processedAt: withdrawal.processedAt,
                completedAt: withdrawal.completedAt,
                user: {
                    id: withdrawal.userId._id,
                    fullName: withdrawal.userId.fullName,
                    email: withdrawal.userId.email,
                    newBalance: user.getBalance()
                },
                // Rate limit info from middleware
                rateLimit: req.withdrawalRateInfo
            }
        });

        console.log(`✅ Rút tiền thành công:`, {
            withdrawalCode: withdrawal.withdrawalCode,
            amount: withdrawal.formattedAmount,
            fee: finalWithdrawalFee.toLocaleString(),
            totalDeducted: totalDeduction.toLocaleString(),
            status: withdrawal.status,
            userNewBalance: user.getBalance().toLocaleString(),
            remainingToday: req.withdrawalRateInfo?.remaining
        });

    } catch (error) {
        console.error('❌ Lỗi khi tạo yêu cầu rút tiền:', error);

        // Handle specific error messages
        let statusCode = 500;
        let message = 'Không thể hoàn thành rút tiền';
        let errorCode = 'WITHDRAWAL_ERROR';

        if (error.message.includes('User not found')) {
            statusCode = 404;
            message = 'Không tìm thấy người dùng';
            errorCode = 'USER_NOT_FOUND';
        } else if (error.message.includes('Insufficient balance') || error.message.includes('Số dư')) {
            statusCode = 400;
            message = error.message;
            errorCode = 'INSUFFICIENT_BALANCE';
        } else if (error.message.includes('validation') || error.name === 'ValidationError') {
            statusCode = 400;
            message = 'Lỗi xác thực: ' + error.message;
            errorCode = 'VALIDATION_ERROR';
        } else if (error.code === 11000) { // Duplicate key error
            statusCode = 409;
            message = 'Mã rút tiền bị trùng, vui lòng thử lại';
            errorCode = 'DUPLICATE_WITHDRAWAL_CODE';
        } else if (error.message.includes('giới hạn')) {
            statusCode = 429;
            message = error.message;
            errorCode = 'RATE_LIMIT_EXCEEDED';
        }

        res.status(statusCode).json({
            success: false,
            message: message,
            error: errorCode,
            details: error.message
        });
    }
};

/**
 * Lấy withdrawal theo ID
 * GET /api/withdrawals/:id
 */
const getWithdrawalById = async (req, res) => {
    try {
        const { id } = req.params;

        const withdrawal = await Withdrawal.findById(id)
            .populate('userId', 'fullName email phoneNumber')
            .populate('processingInfo.processedBy', 'fullName email');

        if (!withdrawal) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bản ghi rút tiền'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Lấy thông tin rút tiền thành công',
            data: withdrawal
        });

        console.log(`Đã lấy thông tin rút tiền: ${withdrawal.withdrawalCode}`);
    } catch (error) {
        console.error('Lỗi khi lấy thông tin rút tiền theo ID:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể lấy thông tin rút tiền',
            error: error.message
        });
    }
};

/**
 * Lấy lịch sử rút tiền của user
 * GET /api/withdrawals/user/:userId
 */
const getUserWithdrawals = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status, limit = 10, skip = 0 } = req.query;

        const withdrawals = await Withdrawal.getUserWithdrawalHistory(userId, {
            status,
            limit: parseInt(limit),
            skip: parseInt(skip)
        });

        res.status(200).json({
            success: true,
            message: `Tìm thấy ${withdrawals.length} bản ghi rút tiền của người dùng`,
            data: withdrawals
        });

        console.log(`Đã lấy ${withdrawals.length} bản ghi rút tiền của người dùng ${userId}`);
    } catch (error) {
        console.error('Lỗi khi lấy lịch sử rút tiền của người dùng:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể lấy lịch sử rút tiền của người dùng',
            error: error.message
        });
    }
};

module.exports = {
    getAllWithdrawals,
    createWithdrawal,
    getWithdrawalById,
    getUserWithdrawals
};
