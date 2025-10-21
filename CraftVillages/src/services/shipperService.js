import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:9999/api';

class ShipperService {
    // Get shipper dashboard statistics
    async getDashboardStats(userId) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/shipper/dashboard/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    }

    // Get assigned orders for shipper
    async getAssignedOrders(userId, status = null) {
        try {
            const token = localStorage.getItem('token');
            const params = status ? { status } : {};
            const response = await axios.get(`${API_URL}/shipper/orders/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                params
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching assigned orders:', error);
            throw error;
        }
    }

    // Get order details
    async getOrderDetails(orderId) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/shipper/orders/detail/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching order details:', error);
            throw error;
        }
    }

    // Update order status
    async updateOrderStatus(orderId, status, notes = '', photos = []) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`${API_URL}/shipper/orders/${orderId}/status`, {
                status,
                notes,
                photos
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error updating order status:', error);
            throw error;
        }
    }

    // Confirm delivery
    async confirmDelivery(orderId, deliveryData) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/shipper/orders/${orderId}/confirm-delivery`, deliveryData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error confirming delivery:', error);
            throw error;
        }
    }

    // Update shipper location
    async updateLocation(userId, location) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`${API_URL}/shipper/location/${userId}`, location, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error updating location:', error);
            throw error;
        }
    }

    // Get shipper earnings
    async getEarnings(userId, startDate = null, endDate = null) {
        try {
            const token = localStorage.getItem('token');
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            
            const response = await axios.get(`${API_URL}/shipper/earnings/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                params
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching earnings:', error);
            throw error;
        }
    }

    // Get shipper reviews
    async getReviews(userId) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/shipper/reviews/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching reviews:', error);
            throw error;
        }
    }

    // Update shipper profile
    async updateProfile(userId, profileData) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`${API_URL}/shipper/profile/${userId}`, profileData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }

    // Update shipper settings
    async updateSettings(userId, settings) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`${API_URL}/shipper/settings/${userId}`, settings, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error updating settings:', error);
            throw error;
        }
    }

    // Get shipper settings
    async getSettings(userId) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/shipper/settings/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching settings:', error);
            throw error;
        }
    }

    // Toggle online/offline status
    async toggleOnlineStatus(userId, isOnline) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`${API_URL}/shipper/status/${userId}`, {
                isOnline
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error toggling online status:', error);
            throw error;
        }
    }

    // Get delivery history
    async getDeliveryHistory(userId, page = 1, limit = 10) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/shipper/history/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                params: { page, limit }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching delivery history:', error);
            throw error;
        }
    }

    // Get available shippers (for admin)
    async getAvailableShippers(zone, vehicleType = null) {
        try {
            const token = localStorage.getItem('token');
            const params = { zone };
            if (vehicleType) params.vehicleType = vehicleType;
            
            const response = await axios.get(`${API_URL}/shipper/available`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                params
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching available shippers:', error);
            throw error;
        }
    }

    // Assign order to shipper (for admin)
    async assignOrder(orderId, shipperId) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/shipper/assign-order`, {
                orderId,
                shipperId
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error assigning order:', error);
            throw error;
        }
    }

    // Get shipper performance metrics
    async getPerformanceMetrics(userId, period = 'month') {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/shipper/performance/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                params: { period }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching performance metrics:', error);
            throw error;
        }
    }
}

export default new ShipperService();
