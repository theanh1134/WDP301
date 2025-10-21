import axios from 'axios';

const API_URL = 'http://localhost:9999';

class UserService {
    async getUserById(userId) {
        const res = await axios.get(`${API_URL}/users/${userId}`);
        return res.data.data;
    }

    async updateUser(userId, payload) {
        const res = await axios.put(`${API_URL}/users/${userId}`, payload);
        return res.data.data;
    }
}

export default new UserService();


