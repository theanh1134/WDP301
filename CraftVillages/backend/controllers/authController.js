const User = require('../models/User');
const Role = require('../models/Role');
const { generateToken } = require('../utils/generateToken');

const register = async (req, res, next) => {
    try {
        const { fullName, email, phoneNumber, address, password, accountType, shopName, businessType } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            // If user exists but email is not verified, allow resending verification
            if (!existingUser.isEmailVerified) {
                const verificationCode = existingUser.generateVerificationCode();
                await existingUser.save();

                return res.status(200).json({
                    success: true,
                    message: 'Email already registered but not verified. Verification code sent.',
                    data: {
                        userId: existingUser._id,
                        email: existingUser.email,
                        role: existingUser.roleId,
                        verificationCode: verificationCode,
                        fullName: existingUser.fullName,
                        isResend: true
                    }
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Email already registered and verified'
                });
            }
        }

        const role = await Role.findOne({ roleName: accountType.toUpperCase() });
        if (!role) {
            return res.status(400).json({
                success: false,
                message: 'Invalid account type'
            });
        }

        const userData = {
            fullName,
            email,
            phoneNumber,
            address,
            passwordHash: password,
            roleId: role._id,
            addresses: address ? [address] : []
        };

        if (accountType.toLowerCase() === 'seller') {
            if (!shopName || !businessType) {
                return res.status(400).json({
                    success: false,
                    message: 'Shop name and business type are required for sellers'
                });
            }
            userData.addresses.push(`Shop: ${shopName}, Type: ${businessType}`);
        }

        const user = new User(userData);
        const verificationCode = user.generateVerificationCode();
        await user.save();

        res.status(201).json({
            success: true,
            message: 'Registration successful. Please check your email for verification code.',
            data: {
                userId: user._id,
                email: user.email,
                role: role.roleName,
                verificationCode: verificationCode, // Send code to frontend
                fullName: fullName
            }
        });
    } catch (error) {
        next(error);
    }
};

const verifyEmail = async (req, res, next) => {
    try {
        const { email, code } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email already verified'
            });
        }

        if (!user.isVerificationCodeValid(code)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification code'
            });
        }

        user.isEmailVerified = true;
        user.verificationCode = null;
        user.verificationCodeExpires = null;
        await user.save();

        const token = generateToken({ id: user._id });

        res.status(200).json({
            success: true,
            message: 'Email verified successfully',
            data: {
                token,
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    role: user.roleId
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

const resendCode = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email already verified'
            });
        }

        const verificationCode = user.generateVerificationCode();
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Verification code sent successfully',
            data: {
                verificationCode: verificationCode, // Send code to frontend
                fullName: user.fullName
            }
        });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).populate('roleId');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        if (!user.isEmailVerified) {
            return res.status(401).json({
                success: false,
                message: 'Please verify your email first'
            });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const token = generateToken({ id: user._id });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    role: user.roleId.roleName,
                    isEmailVerified: user.isEmailVerified
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Please verify your email first'
            });
        }

        const resetCode = user.generateResetCode();
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset code sent to your email',
            data: {
                resetCode: resetCode, // Send code to frontend
                fullName: user.fullName
            }
        });
    } catch (error) {
        next(error);
    }
};

const verifyResetCode = async (req, res, next) => {
    try {
        const { email, code } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!user.isResetCodeValid(code)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset code'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Reset code verified successfully'
        });
    } catch (error) {
        next(error);
    }
};

const resetPassword = async (req, res, next) => {
    try {
        const { email, code, newPassword } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!user.isResetCodeValid(code)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset code'
            });
        }

        user.passwordHash = newPassword;
        user.resetPasswordCode = null;
        user.resetPasswordCodeExpires = null;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Change password with old password verification
const changePassword = async (req, res, next) => {
    try {
        const { userId, oldPassword, newPassword } = req.body;
        if (!userId || !oldPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const valid = await user.comparePassword(oldPassword);
        if (!valid) {
            return res.status(400).json({ success: false, message: 'Mật khẩu cũ không chính xác' });
        }

        user.passwordHash = newPassword;
        await user.save();

        return res.json({ success: true, message: 'Đổi mật khẩu thành công' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    verifyEmail,
    resendCode,
    login,
    forgotPassword,
    verifyResetCode,
    resetPassword,
    changePassword
};

