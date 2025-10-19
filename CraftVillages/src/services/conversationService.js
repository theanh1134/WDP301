import axios from 'axios';

const API_URL = 'http://localhost:9999/api/conversations';

class ConversationService {
    // Get conversations by buyer
    async getByBuyer(buyerId, includeArchived = false) {
        const token = localStorage.getItem('authToken');
        const res = await axios.get(`${API_URL}/buyer/${buyerId}`, {
            params: { includeArchived },
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return res.data.data || [];
    }

    // Get conversations by shop
    async getByShop(shopId, includeArchived = false) {
        const token = localStorage.getItem('authToken');
        const res = await axios.get(`${API_URL}/shop/${shopId}`, {
            params: { includeArchived },
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return res.data.data || [];
    }

    async getByUserId(userId, includeArchived = false) {
        const token = localStorage.getItem('authToken');
        const res = await axios.get(`${API_URL}/user/${userId}`, {
            params: { includeArchived },
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return res.data.data || [];
    }

    // Get conversation by ID
    async getById(conversationId) {
        const token = localStorage.getItem('authToken');
        const res = await axios.get(`${API_URL}/${conversationId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return res.data.data;
    }

    // Create new conversation
    async create(data) {
        const token = localStorage.getItem('authToken');
        const res = await axios.post(API_URL, data, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return res.data;
    }

    // Alias for create
    async createConversation(data) {
        return this.create(data);
    }

    // Get or create conversation with shop
    async getOrCreate(buyerId, shopId, productId = null) {
        const token = localStorage.getItem('authToken');
        const res = await axios.post(`${API_URL}/get-or-create`, {
            buyerId,
            shopId,
            productId
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return res.data.data;
    }

    // Upload images
    async uploadImages(conversationId, imageFiles) {
        const token = localStorage.getItem('authToken');
        const formData = new FormData();

        imageFiles.forEach(file => {
            formData.append('images', file);
        });

        const res = await axios.post(`${API_URL}/${conversationId}/upload`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        return res.data.data; // Returns array of image URLs
    }

    // Send message
    async sendMessage(conversationId, senderInfo, content, messageType = 'TEXT', attachments = [], replyTo = null) {
        const token = localStorage.getItem('authToken');
        const res = await axios.post(`${API_URL}/${conversationId}/messages`, {
            senderInfo,
            content,
            messageType,
            attachments,
            replyTo
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return res.data.data;
    }

    // Mark messages as read
    async markAsRead(conversationId, readerType) {
        const token = localStorage.getItem('authToken');
        await axios.put(`${API_URL}/${conversationId}/read`, {
            readerType
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    }

    // Archive conversation
    async archive(conversationId, archiverType) {
        const token = localStorage.getItem('authToken');
        await axios.put(`${API_URL}/${conversationId}/archive`, {
            archiverType
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    }

    // Close conversation
    async close(conversationId) {
        const token = localStorage.getItem('authToken');
        await axios.put(`${API_URL}/${conversationId}/close`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    }
}

export default new ConversationService();

