import axios from 'axios';

// The API URL is http://localhost:9999, and the shipper routes are mounted at /shipper
const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:9999');

class ShipperService {
    // Get shipper dashboard statistics
    async getDashboardStats(userId) {
        try {
            const token = localStorage.getItem('authToken');
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
    
    // Get shipper profile data
    async getProfile(userId) {
        try {
            const token = localStorage.getItem('authToken');
            console.log(`Fetching profile from ${API_URL}/shipper/profile/${userId}`);
            const response = await axios.get(`${API_URL}/shipper/profile/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching shipper profile:', error);
            throw error;
        }
    }

    // Get assigned orders for shipper
    async getAssignedOrders(userId, status = null) {
        try {
            const token = localStorage.getItem('authToken');
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
            const token = localStorage.getItem('authToken');
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
    async updateOrderStatus(shipmentId, status, notes = '', photos = []) {
        try {
            const token = localStorage.getItem('authToken');
            console.log(`Calling API: PUT /shipper/shipment/${shipmentId}/status`);
            console.log('Payload:', { status, notes, photos: photos.length });
            
            const response = await axios.put(`${API_URL}/shipper/shipment/${shipmentId}/status`, {
                status,
                notes,
                photos
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('Update status response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error updating order status:', error);
            console.error('Error response:', error.response?.data);
            throw error;
        }
    }

    // Confirm delivery
    async confirmDelivery(orderId, deliveryData) {
        try {
            const token = localStorage.getItem('authToken');
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
            const token = localStorage.getItem('authToken');
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
            const token = localStorage.getItem('authToken');
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
            const token = localStorage.getItem('authToken');
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
            const token = localStorage.getItem('authToken'); // Use correct token key
            console.log('Using authToken:', token);
            
            // If there are documents to upload, use FormData
            if (profileData.documents && Object.values(profileData.documents).some(doc => doc && doc.file)) {
                const formData = new FormData();
                
                // Add shipper data
                Object.keys(profileData).forEach(key => {
                    if (key !== 'documents') {
                        if (typeof profileData[key] === 'object' && profileData[key] !== null) {
                            formData.append(key, JSON.stringify(profileData[key]));
                        } else {
                            formData.append(key, profileData[key]);
                        }
                    }
                });
                
                // Add document files
                Object.keys(profileData.documents).forEach(docType => {
                    if (profileData.documents[docType] && profileData.documents[docType].file) {
                        formData.append(`document_${docType}`, profileData.documents[docType].file);
                        console.log(`Appending document ${docType}:`, profileData.documents[docType].file);
                    }
                });
                
                console.log('Sending profile update with files:', userId);
                console.log('Form data entries:');
                for (let pair of formData.entries()) {
                    console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
                }
                
                const response = await axios.put(`${API_URL}/shipper/profile/${userId}`, formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                
                console.log('Profile update response:', response.data);
                
                // Update localStorage if successful
                if (response.data && response.data.success) {
                    this.updateUserLocalStorage(response.data.data);
                }
                
                return response.data;
            } else {
                // Regular JSON request if no files
                console.log('Sending profile update without files:', userId);
                console.log('Profile data:', JSON.stringify(profileData, null, 2));
                
                // Clean up documents object if it exists but has no files
                const cleanData = { ...profileData };
                if (cleanData.documents) {
                    delete cleanData.documents;
                }
                
                const response = await axios.put(`${API_URL}/shipper/profile/${userId}`, cleanData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log('Profile update response:', response.data);
                
                // Update localStorage if successful
                if (response.data && response.data.success) {
                    this.updateUserLocalStorage(response.data.data);
                }
                
                return response.data;
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }

    // Update shipper settings
    async updateSettings(userId, settings) {
        try {
            const token = localStorage.getItem('authToken');
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
            const token = localStorage.getItem('authToken');
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
            const token = localStorage.getItem('authToken');
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
            const token = localStorage.getItem('authToken');
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
            const token = localStorage.getItem('authToken');
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
            const token = localStorage.getItem('authToken');
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
            const token = localStorage.getItem('authToken');
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
    
    // Helper method to update user data in localStorage
    updateUserLocalStorage(responseData) {
        try {
            // Get current user from localStorage
            const currentUser = localStorage.getItem('user');
            if (!currentUser) return;
            
            const user = JSON.parse(currentUser);
            
            // Extract user and shipper data from response
            const { user: updatedUserData, shipper: updatedShipperData } = responseData;
            
            // Create updated user object
            const updatedUser = {
                ...user,
                fullName: updatedUserData?.fullName || user.fullName,
                phoneNumber: updatedUserData?.phoneNumber || user.phoneNumber,
                // Add shipper info
                shipperInfo: updatedShipperData
            };
            
            console.log('Updating localStorage with:', updatedUser);
            
            // Save to localStorage
            localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (error) {
            console.error('Error updating localStorage:', error);
        }
    }
}

const shipperService = new ShipperService();
export default shipperService;
