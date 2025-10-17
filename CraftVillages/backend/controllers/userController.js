const User = require('../models/User');

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select('-passwordHash');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get user', error: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, phoneNumber, avatarUrl, addresses } = req.body;

        const update = {};
        if (typeof fullName === 'string') update.fullName = fullName;
        if (typeof phoneNumber === 'string') update.phoneNumber = phoneNumber;
        if (typeof avatarUrl === 'string') update.avatarUrl = avatarUrl;
        if (addresses) update.addresses = Array.isArray(addresses) ? addresses : [addresses];

        const user = await User.findByIdAndUpdate(id, update, { new: true, runValidators: true }).select('-passwordHash');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, message: 'Profile updated', data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update user', error: error.message });
    }
};

module.exports = { getUserById, updateUser };


