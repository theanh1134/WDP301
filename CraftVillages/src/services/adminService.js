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

/**
 * Get Seller Performance Metrics (rankings and scores)
 * @param {string} period - 'day', 'week', 'month', 'year'
 * @param {number} limit - Number of sellers to include
 */
const getSellerPerformance = async (period = 'month', limit = 10) => {
    try {
        const api = createAuthRequest();
        const response = await api.get(`/api/admin/sellers/performance?period=${period}&limit=${limit}`);
        return response.data;
    } catch (error) {
        console.error('Error getting seller performance:', error);
        throw error.response?.data || error;
    }
};

/**
 * Get Commission Analytics
 * @param {string} period - 'day', 'week', 'month', 'year'
 */
const getCommissionAnalytics = async (period = 'month') => {
    try {
        const api = createAuthRequest();
        const response = await api.get(`/api/admin/commission/analytics?period=${period}`);
        return response.data;
    } catch (error) {
        console.error('Error getting commission analytics:', error);
        throw error.response?.data || error;
    }
};

/**
 * Get Commission by Seller
 * @param {number} limit - Number of sellers to return
 * @param {string} period - 'day', 'week', 'month', 'year'
 */
const getCommissionBySeller = async (limit = 5, period = 'month') => {
    try {
        const api = createAuthRequest();
        const response = await api.get(`/api/admin/commission/by-seller?limit=${limit}&period=${period}`);
        return response.data;
    } catch (error) {
        console.error('Error getting commission by seller:', error);
        throw error.response?.data || error;
    }
};

/**
 * Get Commission by Region
 * @param {string} period - 'day', 'week', 'month', 'year'
 */
const getCommissionByRegion = async (period = 'month') => {
    try {
        const api = createAuthRequest();
        const response = await api.get(`/api/admin/commission/by-region?period=${period}`);
        return response.data;
    } catch (error) {
        console.error('Error getting commission by region:', error);
        throw error.response?.data || error;
    }
};

/**
 * Get Commission History (12 months)
 */
const getCommissionHistory = async () => {
    try {
        const api = createAuthRequest();
        const response = await api.get(`/api/admin/commission/history`);
        return response.data;
    } catch (error) {
        console.error('Error getting commission history:', error);
        throw error.response?.data || error;
    }
};

/**
 * List seller commission overview
 * @param {Object} params - { page, limit, search, includeInactive }
 */
const getSellerCommissionList = async (params = {}) => {
    try {
        const api = createAuthRequest();
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                searchParams.append(key, value);
            }
        });
        const query = searchParams.toString();
        const response = await api.get(`/api/admin/commission/sellers${query ? `?${query}` : ''}`);
        return response.data;
    } catch (error) {
        console.error('Error getting seller commission list:', error);
        throw error.response?.data || error;
    }
};

/**
 * Update seller commission rate
 * @param {string} shopId
 * @param {Object} payload - { percentageRate, reason, note }
 */
const updateSellerCommission = async (shopId, payload) => {
    try {
        const api = createAuthRequest();
        const response = await api.put(`/api/admin/commission/sellers/${shopId}`, payload);
        return response.data;
    } catch (error) {
        console.error('Error updating seller commission:', error);
        throw error.response?.data || error;
    }
};

/**
 * Get commission history of a seller
 * @param {string} shopId
 */
const getSellerCommissionHistory = async (shopId) => {
    try {
        const api = createAuthRequest();
        const response = await api.get(`/api/admin/commission/sellers/${shopId}/history`);
        return response.data;
    } catch (error) {
        console.error('Error getting seller commission history:', error);
        throw error.response?.data || error;
    }
};

/**
 * Update global default commission rate
 * @param {Object} payload - { percentageRate, reason?, note?, overrideShopConfigs? }
 */
const updateGlobalCommission = async (payload) => {
    try {
        const api = createAuthRequest();
        const response = await api.put(`/api/admin/commission/global`, payload);
        return response.data;
    } catch (error) {
        console.error('Error updating global commission:', error);
        throw error.response?.data || error;
    }
};

/**
 * Customer Analytics APIs
 */
const getCustomerOverview = async (params = {}) => {
    try {
        const api = createAuthRequest();
        const queryString = new URLSearchParams(params).toString();
        const response = await api.get(`/api/admin/analytics/customers/overview?${queryString}`);
        return response.data;
    } catch (error) {
        console.error('Error getting customer overview:', error);
        throw error.response?.data || error;
    }
};

const getTopCustomersByOrders = async (params = {}) => {
    try {
        const api = createAuthRequest();
        const queryString = new URLSearchParams(params).toString();
        const response = await api.get(`/api/admin/analytics/customers/top-by-orders?${queryString}`);
        return response.data;
    } catch (error) {
        console.error('Error getting top customers by orders:', error);
        throw error.response?.data || error;
    }
};

const getTopCustomersByRevenue = async (params = {}) => {
    try {
        const api = createAuthRequest();
        const queryString = new URLSearchParams(params).toString();
        const response = await api.get(`/api/admin/analytics/customers/top-by-revenue?${queryString}`);
        return response.data;
    } catch (error) {
        console.error('Error getting top customers by revenue:', error);
        throw error.response?.data || error;
    }
};

const getCustomerList = async (params = {}) => {
    try {
        const api = createAuthRequest();
        const queryString = new URLSearchParams(params).toString();
        const response = await api.get(`/api/admin/analytics/customers/list?${queryString}`);
        return response.data;
    } catch (error) {
        console.error('Error getting customer list:', error);
        throw error.response?.data || error;
    }
};

const adminService = {
    getRevenueOverview,
    getRevenueChart,
    getRevenueByCategory,
    getTopSellers,
    getSellerPerformance,
    getCommissionAnalytics,
    getCommissionBySeller,
    getCommissionByRegion,
    getCommissionHistory,
    getSellerCommissionList,
    updateSellerCommission,
    getSellerCommissionHistory,
    updateGlobalCommission,
    // Customer Analytics
    getCustomerOverview,
    getTopCustomersByOrders,
    getTopCustomersByRevenue,
    getCustomerList
};

export default adminService;

