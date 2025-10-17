import axios from 'axios';

const API_URL = 'http://localhost:9999';

class ReviewService {
    async getProductReviews(productId) {
        try {
            console.log('Fetching reviews for product:', productId);
            const res = await axios.get(`${API_URL}/reviews/product/${productId}/display`);
            console.log('Reviews response:', res.data);
            return res.data.data;
        } catch (error) {
            console.error('Error fetching product reviews:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            return {
                reviews: [],
                totalReviews: 0,
                averageRating: 0
            };
        }
    }

    async getProductRating(productId) {
        try {
            const res = await axios.get(`${API_URL}/reviews/product/${productId}/rating`);
            return res.data.data;
        } catch (error) {
            console.error('Error fetching product rating:', error);
            return {
                averageRating: 0,
                totalReviews: 0
            };
        }
    }
}

export default new ReviewService();
