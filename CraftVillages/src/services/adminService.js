import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:9999';

// Get auth token
const getAuthToken = () => {
    return localStorage.getItem('authToken');
};

// Create axios instance with auth header
const createAuthRequest = () => {
    return axios.create({
        baseURL: API_URL,
        headers: {
            'Authorization': `Bearer ${getAuthToken()}`,
            'Content-Type': 'application/json'
        }
    });
};

/**
 * Get Revenue Overview
 * @param {string} period - 'day', 'week', 'month', 'year'
 */
const getRevenueOverview = async (period = 'month') => {
    try {
        const api = createAuthRequest();
        const response = await api.get(`/api/admin/revenue/overview?period=${period}`);
        return response.data;
    } catch (error) {
        console.error('Error getting revenue overview:', error);
        throw error.response?.data || error;
    }
};

/**
 * Get Revenue Chart Data
 * @param {string} period - 'month', 'year'
 * @param {number} year - Year for data
 */
const getRevenueChart = async (period = 'year', year = new Date().getFullYear()) => {
    try {
        const api = createAuthRequest();
        const response = await api.get(`/api/admin/revenue/chart?period=${period}&year=${year}`);
        return response.data;
    } catch (error) {
        console.error('Error getting revenue chart:', error);
        throw error.response?.data || error;
    }
};

/**
 * Get Revenue by Category
 * @param {string} period - 'day', 'week', 'month', 'year'
 */
const getRevenueByCategory = async (period = 'month') => {
    try {
        const api = createAuthRequest();
        const response = await api.get(`/api/admin/revenue/category?period=${period}`);
        return response.data;
    } catch (error) {
        console.error('Error getting revenue by category:', error);
        throw error.response?.data || error;
    }
};

/**
 * Get Top Sellers
 * @param {number} limit - Number of sellers to return
 * @param {string} period - 'day', 'week', 'month', 'year'
 */
const getTopSellers = async (limit = 5, period = 'month') => {
    try {
        const api = createAuthRequest();
        const response = await api.get(`/api/admin/sellers/top?limit=${limit}&period=${period}`);
        return response.data;
    } catch (error) {
        console.error('Error getting top sellers:', error);
        throw error.response?.data || error;
    }
};

const adminService = {
    getRevenueOverview,
    getRevenueChart,
    getRevenueByCategory,
    getTopSellers
};

export default adminService;

