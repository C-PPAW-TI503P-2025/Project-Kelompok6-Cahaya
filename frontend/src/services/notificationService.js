import api from './api';

export const notificationService = {
    // Get all notifications for current user
    getAllNotifications: async () => {
        const response = await api.get('/notifications');
        return response.data;
    },

    // Mark notification as read
    markAsRead: async (id) => {
        const response = await api.put(`/notifications/${id}/read`);
        return response.data;
    },

    // Mark all notifications as read
    markAllAsRead: async () => {
        const response = await api.put('/notifications/mark-all-read');
        return response.data;
    },

    // Delete notification
    deleteNotification: async (id) => {
        const response = await api.delete(`/notifications/${id}`);
        return response.data;
    },

    // Create notification (admin only)
    createNotification: async (notificationData) => {
        const response = await api.post('/notifications', notificationData);
        return response.data;
    },
};

export default notificationService;
