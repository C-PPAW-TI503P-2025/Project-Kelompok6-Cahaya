import api from './api';

export const iotService = {
    // Get latest sensor data
    getLatestSensorData: async () => {
        const response = await api.get('/iot/latest');
        return response.data;
    },

    // Get sensor data history with pagination
    getSensorHistory: async (params) => {
        const { startDate, endDate, limit, page } = params;
        const queryParams = new URLSearchParams();
        if (startDate) queryParams.append('start', startDate);
        if (endDate) queryParams.append('end', endDate);
        if (limit) queryParams.append('limit', limit);
        if (page) queryParams.append('page', page);

        const response = await api.get(`/iot/data?${queryParams.toString()}`);
        return response.data;
    },

    // Get sensor data by date range
    getSensorDataByDateRange: async (startDate, endDate) => {
        const response = await api.get(`/iot/data/range?start=${startDate}&end=${endDate}`);
        return response.data;
    },

    // Get statistics
    getStats: async () => {
        const response = await api.get('/iot/stats');
        return response.data;
    },

    // Control relay (manual mode)
    controlRelay: async (status) => {
        const response = await api.post('/iot/relay', {
            status // true or false
        });
        return response.data;
    },

    // Get device settings (mode, threshold)
    getDeviceSettings: async () => {
        const response = await api.get('/iot/settings');
        return response.data;
    },

    // Update device settings (mode, threshold, manual_relay_state)
    updateDeviceSettings: async (settings) => {
        const response = await api.put('/iot/settings', settings);
        return response.data;
    },

    // Get settings (alias for compatibility)
    getSettings: async () => {
        const response = await api.get('/iot/settings');
        return response.data;
    },

    // Update settings (alias for compatibility)
    updateSettings: async (settings) => {
        const response = await api.put('/iot/settings', settings);
        return response.data;
    },

    // Get statistics summary
    getStatistics: async (params) => {
        const queryParams = new URLSearchParams();
        if (params?.startDate) queryParams.append('startDate', params.startDate);
        if (params?.endDate) queryParams.append('endDate', params.endDate);

        const response = await api.get(`/iot/statistics?${queryParams.toString()}`);
        return response.data;
    },

    // Get activity log
    getActivityLog: async (limit = 10) => {
        const response = await api.get(`/iot/activity?limit=${limit}`);
        return response.data;
    },

    // Clear history
    clearHistory: async () => {
        const response = await api.delete('/iot/history');
        return response.data;
    },
};

export default iotService;
