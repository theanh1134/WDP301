import axios from 'axios';

const API_URL = 'http://localhost:9999';

class OrderService {
    async getOrdersByUser(userId) {
        const token = localStorage.getItem('authToken');
        const res = await axios.get(`${API_URL}/orders/user/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            },
            params: {
                _t: Date.now() // Cache busting
            }
        });
        return res.data.data || [];
    }

    async getOrderById(orderId) {
        const token = localStorage.getItem('authToken');
        const res = await axios.get(`${API_URL}/orders/detail/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return res.data.data;
    }

    // Seller order management
    async getOrdersByShop(shopId, params = {}) {
        const token = localStorage.getItem('authToken');
        const queryParams = new URLSearchParams(params).toString();
        const res = await axios.get(`${API_URL}/orders/shop/${shopId}?${queryParams}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return res.data;
    }

    async getOrderStatistics(shopId) {
        const token = localStorage.getItem('authToken');
        const res = await axios.get(`${API_URL}/orders/shop/${shopId}/statistics`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return res.data.data;
    }

    async getShopRevenue(shopId, params = {}) {
        const token = localStorage.getItem('authToken');
        const queryParams = new URLSearchParams(params).toString();
        const res = await axios.get(`${API_URL}/orders/shop/${shopId}/revenue?${queryParams}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return res.data.data;
    }

    async getShopAnalytics(shopId, params = {}) {
        const token = localStorage.getItem('authToken');
        const queryParams = new URLSearchParams(params).toString();
        const res = await axios.get(`${API_URL}/orders/shop/${shopId}/analytics?${queryParams}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return res.data.data;
    }

    async getProductAnalytics(productId, timeRange = '30days') {
        const token = localStorage.getItem('authToken');
        const res = await axios.get(`${API_URL}/orders/product/${productId}/analytics?timeRange=${timeRange}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return res.data;
    }

    async updateOrderStatus(orderId, status, note = '', cancellationReason = null) {
        const token = localStorage.getItem('authToken');
        const res = await axios.put(`${API_URL}/orders/${orderId}/status`,
            { status, note, cancellationReason },
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return res.data;
    }

    async cancelOrder(orderId) {
        const token = localStorage.getItem('authToken');
        console.log('Token for cancel order:', token ? 'Token exists' : 'No token found');

        if (!token) {
            throw new Error('No authentication token found. Please login again.');
        }

        const res = await axios.put(`${API_URL}/orders/${orderId}/cancel`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return res.data;
    }

    async confirmDelivery(orderId) {
        const token = localStorage.getItem('authToken');
        console.log('Token for confirm delivery:', token ? 'Token exists' : 'No token found');

        if (!token) {
            throw new Error('No authentication token found. Please login again.');
        }

        const res = await axios.put(`${API_URL}/orders/${orderId}/confirm-delivery`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return res.data;
    }

    async submitReview(reviewData) {
        const token = localStorage.getItem('authToken');
        const user = JSON.parse(localStorage.getItem('user'));

        if (!token) {
            throw new Error('No authentication token found. Please login again.');
        }

        // Tạo FormData để gửi kèm file
        const formData = new FormData();
        formData.append('productId', reviewData.productId);
        formData.append('orderId', reviewData.orderId);
        formData.append('userId', user?._id || user?.id); // Thêm userId
        formData.append('rating', reviewData.rating);
        formData.append('title', reviewData.title);
        formData.append('content', reviewData.content);

        // Thêm các file ảnh nếu có
        if (reviewData.images && reviewData.images.length > 0) {
            reviewData.images.forEach((image, index) => {
                formData.append('images', image);
            });
        }

        const res = await axios.post(`${API_URL}/reviews`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        return res.data;
    }

    async getUserReview(orderId) {
        const token = localStorage.getItem('authToken');

        if (!token) {
            throw new Error('No authentication token found. Please login again.');
        }

        const res = await axios.get(`${API_URL}/reviews/order/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return res.data.data;
    }

    async updateReview(reviewId, reviewData) {
        const token = localStorage.getItem('authToken');

        if (!token) {
            throw new Error('No authentication token found. Please login again.');
        }

        const res = await axios.put(`${API_URL}/reviews/${reviewId}`, reviewData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return res.data;
    }

    async deleteReview(reviewId) {
        const token = localStorage.getItem('authToken');

        if (!token) {
            throw new Error('No authentication token found. Please login again.');
        }

        const res = await axios.delete(`${API_URL}/reviews/${reviewId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return res.data;
    }
}

export default new OrderService();


