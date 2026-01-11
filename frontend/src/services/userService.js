import api from './api';

export const userService = {
    // Get all users (admin only)
    getAllUsers: async () => {
        const response = await api.get('/users');
        return response.data;
    },

    // Get user by ID
    getUserById: async (id) => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },

    // Create new user (admin only)
    createUser: async (userData) => {
        const response = await api.post('/users', userData);
        return response.data;
    },

    // Update user (admin only)
    updateUser: async (id, userData) => {
        const response = await api.put(`/users/${id}`, userData);
        return response.data;
    },

    // Delete user (admin only)
    deleteUser: async (id) => {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    },
};

export default userService;
