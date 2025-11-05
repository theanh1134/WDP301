import axios from 'axios';

const API_URL = 'http://localhost:9999/return';

class ReturnService {
    // Get return requests by shop
    async getReturnsByShop(shopId, params = {}) {
        try {
            const response = await axios.get(`${API_URL}/shop/${shopId}`, { params });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Get return statistics by shop
    async getReturnStatisticsByShop(shopId) {
        try {
            const response = await axios.get(`${API_URL}/shop/${shopId}/statistics`);
            return response.data.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Get returned product IDs by order
    async getReturnedProductIds(orderId) {
        try {
            const response = await axios.get(`${API_URL}/order/${orderId}/product-ids`);
            return response.data.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Create return request
    async createReturn(formData) {
        try {
            const response = await axios.post(API_URL, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Count user returns in last month
    async countUserReturns(userId) {
        try {
            const response = await axios.get(`${API_URL}/count-return/${userId}`);
            return response.data.count;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    handleError(error) {
        if (error.response) {
            // Server responded with error
            return new Error(error.response.data.message || 'An error occurred with the return operation');
        }
        if (error.request) {
            // Request made but no response
            return new Error('Could not connect to the server. Please check your internet connection.');
        }
        // Other errors
        return new Error('An unexpected error occurred');
    }
}

export default new ReturnService();

