const { verifyToken } = require('../utils/generateToken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        console.log('=== Auth Middleware ===');
        console.log('Path:', req.path);
        console.log('Method:', req.method);

        const token = req.header('Authorization')?.replace('Bearer ', '');
        console.log('Token exists:', !!token);

        if (!token) {
            console.log('❌ No token provided');
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const decoded = verifyToken(token);
        console.log('Decoded user ID:', decoded.id);

        const user = await User.findById(decoded.id).populate('roleId');

        if (!user) {
            console.log('❌ User not found');
            return res.status(401).json({
                success: false,
                message: 'Token is not valid.'
            });
        }

        if (!user.isActive) {
            console.log('❌ User is deactivated');
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated.'
            });
        }

        console.log('✅ Auth successful, user:', user._id);
        req.user = user;
        next();
    } catch (error) {
        console.log('❌ Auth error:', error.message);
        res.status(401).json({
            success: false,
            message: 'Token is not valid.',
            error: error.message
        });
    }
};

const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        if (!roles.includes(req.user.roleId.roleName)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions.'
            });
        }

        next();
    };
};

module.exports = {
    auth,
    requireRole
};

