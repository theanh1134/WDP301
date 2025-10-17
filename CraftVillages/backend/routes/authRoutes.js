const express = require('express');
const router = express.Router();
const {
    register,
    verifyEmail,
    resendCode,
    login,
    forgotPassword,
    verifyResetCode,
    resetPassword,
    changePassword
} = require('../controllers/authController');

router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/resend-code', resendCode);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);
router.post('/change-password', changePassword);

module.exports = router;

