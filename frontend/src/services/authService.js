import api from './api';

export const authService = {
    // Login
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    // Register (if needed)
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    // Logout
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    // Get current user from localStorage
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },
};

export default authService;
