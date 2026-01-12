import api from './api';

export const deviceService = {
    // Get all devices
    getAllDevices: async () => {
        const response = await api.get('/devices');
        return response.data;
    },

    // Get device by ID
    getDeviceById: async (id) => {
        const response = await api.get(`/devices/${id}`);
        return response.data;
    },

    // Create new device (admin only)
    createDevice: async (deviceData) => {
        const response = await api.post('/devices', deviceData);
        return response.data;
    },

    // Update device (admin only)
    updateDevice: async (id, deviceData) => {
        const response = await api.put(`/devices/${id}`, deviceData);
        return response.data;
    },

    // Delete device (admin only)
    deleteDevice: async (id) => {
        const response = await api.delete(`/devices/${id}`);
        return response.data;
    },
};

export default deviceService;
