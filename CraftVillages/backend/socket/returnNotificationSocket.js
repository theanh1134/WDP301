/**
 * Return Notification Socket Handler
 * Handles real-time notifications for return/refund requests
 */

const User = require('../models/User');
const Role = require('../models/Role');

// Store online staff users
const onlineStaff = new Map(); // Map<userId, socketId>

function setupReturnNotificationSocket(io) {
    io.on('connection', (socket) => {
        console.log('🔌 Socket connected:', socket.id);

        /**
         * Staff joins notification room
         * When staff logs in, they register to receive return notifications
         */
        socket.on('staff-online', async (data) => {
            try {
                const { userId, role } = data;
                
                // Verify user is staff
                const user = await User.findById(userId).populate('roleId');
                if (!user) {
                    console.log('❌ User not found:', userId);
                    return;
                }

                const roleName = user.roleId?.roleName;
                
                // Check if user has staff role
                const staffRoles = ['RETURN_STAFF', 'SELLER_STAFF', 'ADMIN_BUSINESS'];
                if (!staffRoles.includes(roleName)) {
                    console.log('❌ User is not staff:', userId, roleName);
                    return;
                }

                // Register staff as online
                onlineStaff.set(userId, socket.id);
                socket.userId = userId;
                socket.userRole = roleName;

                // Join staff notification room
                socket.join('staff-notifications');
                
                console.log(`✅ Staff ${userId} (${roleName}) joined notification room (socket: ${socket.id})`);
                console.log(`👥 Online staff count: ${onlineStaff.size}`);

                // Send confirmation
                socket.emit('staff-online-confirmed', {
                    success: true,
                    message: 'Successfully joined notification room'
                });

            } catch (error) {
                console.error('❌ Error in staff-online:', error);
                socket.emit('error', { message: 'Failed to join notification room' });
            }
        });

        /**
         * Staff leaves notification room
         */
        socket.on('staff-offline', (userId) => {
            if (onlineStaff.has(userId)) {
                onlineStaff.delete(userId);
                socket.leave('staff-notifications');
                console.log(`👋 Staff ${userId} left notification room`);
                console.log(`👥 Online staff count: ${onlineStaff.size}`);
            }
        });

        /**
         * Handle disconnect
         */
        socket.on('disconnect', () => {
            if (socket.userId) {
                onlineStaff.delete(socket.userId);
                console.log(`🔌 Staff ${socket.userId} disconnected`);
                console.log(`👥 Online staff count: ${onlineStaff.size}`);
            }
        });
    });
}

/**
 * Emit new return request notification to all online staff
 * Called from returnController when a new return is created
 */
function notifyNewReturnRequest(io, returnData) {
    try {
        console.log('📢 Broadcasting new return request to staff...');
        console.log('Return ID:', returnData._id);
        console.log('RMA Code:', returnData.rmaCode);
        console.log('Online staff count:', onlineStaff.size);

        const notification = {
            type: 'NEW_RETURN_REQUEST',
            returnId: returnData._id,
            rmaCode: returnData.rmaCode,
            orderCode: returnData.orderId?.orderCode || 'N/A',
            buyerName: returnData.buyerId?.fullName || 'Khách hàng',
            shopName: returnData.shopId?.shopName || 'Cửa hàng',
            reasonCode: returnData.reasonCode,
            requestedResolution: returnData.requestedResolution,
            createdAt: returnData.createdAt,
            message: `Có 1 đơn hoàn hàng mới từ ${returnData.buyerId?.fullName || 'khách hàng'}`,
            timestamp: new Date()
        };

        // Broadcast to all staff in the notification room
        io.to('staff-notifications').emit('new-return-notification', notification);
        
        console.log('✅ Notification broadcasted to staff room');
        console.log('Notification data:', JSON.stringify(notification, null, 2));

    } catch (error) {
        console.error('❌ Error broadcasting return notification:', error);
    }
}

/**
 * Get count of online staff
 */
function getOnlineStaffCount() {
    return onlineStaff.size;
}

/**
 * Check if specific staff is online
 */
function isStaffOnline(userId) {
    return onlineStaff.has(userId);
}

module.exports = {
    setupReturnNotificationSocket,
    notifyNewReturnRequest,
    getOnlineStaffCount,
    isStaffOnline
};

