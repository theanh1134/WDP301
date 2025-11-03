import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:9999';

class StaffOrderService {
    /**
     * Get all orders for staff management
     * @param {Object} params - Query parameters (status, search, page, limit)
     * @returns {Promise} Order list with pagination
     */
    async getAllStaffOrders(params = {}) {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${API_URL}/stafforders`, {
                params,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching staff orders:', error);
            throw error;
        }
    }

    /**
     * Get statistics for staff orders dashboard
     * @returns {Promise} Statistics data
     */
    async getStatistics() {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${API_URL}/stafforders/statistics`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching statistics:', error);
            throw error;
        }
    }

    /**
     * Get available shippers (online and approved)
     * @returns {Promise} List of available shippers
     */
    async getAvailableShippers() {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${API_URL}/stafforders/available-shippers`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching available shippers:', error);
            throw error;
        }
    }

    /**
     * Assign an order to a shipper
     * @param {String} orderId - Order ID
     * @param {String} shipperId - Shipper ID
     * @param {Object} additionalData - Additional data (pickup location, estimated time, etc.)
     * @returns {Promise} Assignment result with shipment data
     */
    async assignOrderToShipper(orderId, shipperId, additionalData = {}) {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post(
                `${API_URL}/stafforders/${orderId}/assign`,
                {
                    shipperId,
                    ...additionalData
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error assigning order to shipper:', error);
            throw error;
        }
    }

    /**
     * Get order detail by ID
     * @param {String} orderId - Order ID
     * @returns {Promise} Order detail
     */
    async getOrderDetail(orderId) {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${API_URL}/stafforders/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching order detail:', error);
            throw error;
        }
    }

    /**
     * Get shipment history/tracking for an order
     * @param {String} orderId - Order ID
     * @returns {Promise} Shipment tracking data
     */
    async getShipmentTracking(orderId) {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${API_URL}/stafforders/${orderId}/shipment`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching shipment tracking:', error);
            throw error;
        }
    }

    /**
     * Reassign order to another shipper
     * @param {String} orderId - Order ID
     * @param {String} newShipperId - New Shipper ID
     * @param {String} reason - Reason for reassignment
     * @returns {Promise} Reassignment result
     */
    async reassignOrder(orderId, newShipperId, reason = '') {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.put(
                `${API_URL}/stafforders/${orderId}/reassign`,
                {
                    shipperId: newShipperId,
                    reason
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error reassigning order:', error);
            throw error;
        }
    }
}

const staffOrderService = new StaffOrderService();
export default staffOrderService;
