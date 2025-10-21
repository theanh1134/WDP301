import axios from 'axios';

const API_URL = 'http://localhost:9999/api';

class CategoryService {
    // Get all categories
    async getAllCategories() {
        try {
            const response = await axios.get(`${API_URL}/categories`);
            return response.data;
        } catch (error) {
            console.error('Get categories error:', error);
            throw error.response?.data || error;
        }
    }

    // Get category by ID
    async getCategoryById(categoryId) {
        try {
            const response = await axios.get(`${API_URL}/categories/${categoryId}`);
            return response.data;
        } catch (error) {
            console.error('Get category error:', error);
            throw error.response?.data || error;
        }
    }

    // Create new category (admin only)
    async createCategory(categoryData) {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Vui lòng đăng nhập');
            }

            const response = await axios.post(
                `${API_URL}/categories`,
                categoryData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Create category error:', error);
            throw error.response?.data || error;
        }
    }
}

export default new CategoryService();

