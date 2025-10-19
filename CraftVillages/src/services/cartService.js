import axios from 'axios';

const API_URL = 'http://localhost:9999';

class CartService {
    async getCart(userId) {
        try {
            const response = await axios.get(`${API_URL}/carts/${userId}`);
            return response.data.cart;
        } catch (error) {
            // If cart not found, return empty cart instead of throwing error
            if (error.response?.status === 404) {
                return {
                    userId,
                    items: [],
                    status: 'ACTIVE',
                    currency: 'VND',
                    subtotal: 0,
                    estimatedTotal: 0
                };
            }
            throw this.handleError(error);
        }
    }

    async addToCart(userId, item) {
        try {
            const response = await axios.post(`${API_URL}/carts`, {
                userId,
                items: [item],
                currency: 'VND'
            });
            return response.data.cart;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async updateQuantity(userId, productId, quantity) {
        try {
            const response = await axios.put(`${API_URL}/carts/quantity`, {
                userId,
                productId,
                quantity
            });
            return response.data.cart;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async removeItem(userId, productId) {
        try {
            const response = await axios.delete(`${API_URL}/carts/${userId}/item/${productId}`);
            return response.data.cart;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async toggleItemSelection(userId, productId, isSelected) {
        try {
            const response = await axios.put(`${API_URL}/carts/${userId}/toggle-select/${productId}`, {
                isSelected
            });
            return response.data.cart;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    handleError(error) {
        if (error.response) {
            // Server responded with error
            return new Error(error.response.data.message || 'An error occurred with the cart operation');
        }
        if (error.request) {
            // Request made but no response
            return new Error('Could not connect to the server. Please check your internet connection.');
        }
        // Other errors
        return new Error('An unexpected error occurred');
    }
}

export default new CartService();
