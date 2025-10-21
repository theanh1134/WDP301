import axios from 'axios';

const API_BASE_URL = 'http://localhost:9999/api';

class ShopService {
    // Check if user has a shop
    async checkUserShop(userId) {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${API_BASE_URL}/shops/user/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            if (error.response?.status === 404) {
                return { success: false, message: 'No shop found' };
            }
            throw this.handleError(error);
        }
    }

    // Register a new shop
    async registerShop(shopData) {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post(`${API_BASE_URL}/shops/register`, shopData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Get shop by ID
    async getShopById(shopId) {
        try {
            const response = await axios.get(`${API_BASE_URL}/shops/${shopId}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Update shop
    async updateShop(shopId, updates) {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.put(`${API_BASE_URL}/shops/${shopId}`, updates, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Get all shops
    async getAllShops(params = {}) {
        try {
            const response = await axios.get(`${API_BASE_URL}/shops`, { params });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    handleError(error) {
        if (error.response) {
            return new Error(error.response.data.message || 'An error occurred');
        } else if (error.request) {
            return new Error('No response from server');
        } else {
            return new Error(error.message || 'An error occurred');
        }
    }
}

export default new ShopService();

