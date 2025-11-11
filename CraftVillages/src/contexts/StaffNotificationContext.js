import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import { toast } from 'react-toastify';

const StaffNotificationContext = createContext();

export const useStaffNotification = () => {
    const context = useContext(StaffNotificationContext);
    if (!context) {
        throw new Error('useStaffNotification must be used within StaffNotificationProvider');
    }
    return context;
};

export const StaffNotificationProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [pendingReturnsCount, setPendingReturnsCount] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const [notifications, setNotifications] = useState([]);

    // Initialize socket connection
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (!user) {
            console.log('No user found, skipping socket connection');
            return;
        }

        const userRole = user.role || user.roleId?.roleName;
        const staffRoles = ['RETURN_STAFF', 'SELLER_STAFF', 'ADMIN_BUSINESS'];
        
        if (!staffRoles.includes(userRole)) {
            console.log('User is not staff, skipping socket connection');
            return;
        }

        console.log('🔌 Initializing staff notification socket...');
        
        const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:9999', {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        newSocket.on('connect', () => {
            console.log('✅ Socket connected:', newSocket.id);
            setIsConnected(true);
            
            // Register as staff
            newSocket.emit('staff-online', {
                userId: user._id || user.id,
                role: userRole
            });
        });

        newSocket.on('staff-online-confirmed', (data) => {
            console.log('✅ Staff registration confirmed:', data);
        });

        newSocket.on('disconnect', () => {
            console.log('🔌 Socket disconnected');
            setIsConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error);
            setIsConnected(false);
        });

        // Listen for new return notifications
        newSocket.on('new-return-notification', (notification) => {
            console.log('🔔 New return notification received:', notification);
            
            // Add to notifications list
            setNotifications(prev => [notification, ...prev]);
            
            // Increment pending count
            setPendingReturnsCount(prev => prev + 1);
            
            // Show toast notification
            toast.info(
                <div>
                    <strong>🔔 Đơn hoàn hàng mới!</strong>
                    <div style={{ fontSize: '0.9em', marginTop: '4px' }}>
                        <div>Mã: <strong>{notification.rmaCode}</strong></div>
                        <div>Khách hàng: {notification.buyerName}</div>
                        <div>Cửa hàng: {notification.shopName}</div>
                    </div>
                </div>,
                {
                    position: "top-right",
                    autoClose: 8000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    onClick: () => {
                        // Navigate to return detail
                        window.location.href = `/staff/returns/${notification.returnId}`;
                    }
                }
            );
            
            // Play notification sound
            playNotificationSound();
        });

        setSocket(newSocket);

        return () => {
            if (newSocket) {
                const user = JSON.parse(localStorage.getItem('user'));
                if (user) {
                    newSocket.emit('staff-offline', user._id || user.id);
                }
                newSocket.disconnect();
            }
        };
    }, []);

    // Fetch initial pending count
    const fetchPendingCount = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:9999/staff/returns/pending-count');
            const data = await response.json();
            if (data.success) {
                setPendingReturnsCount(data.count);
            }
        } catch (error) {
            console.error('Error fetching pending count:', error);
        }
    }, []);

    useEffect(() => {
        fetchPendingCount();
    }, [fetchPendingCount]);

    // Play notification sound
    const playNotificationSound = () => {
        try {
            const audio = new Audio('/notification.mp3');
            audio.volume = 0.5;
            audio.play().catch(err => console.log('Could not play sound:', err));
        } catch (error) {
            console.log('Notification sound not available');
        }
    };

    const value = {
        socket,
        isConnected,
        pendingReturnsCount,
        setPendingReturnsCount,
        notifications,
        setNotifications,
        refreshPendingCount: fetchPendingCount
    };

    return (
        <StaffNotificationContext.Provider value={value}>
            {children}
        </StaffNotificationContext.Provider>
    );
};

