// Format date to readable string
export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

// Format Lux value
export const formatLux = (lux) => {
    if (lux === null || lux === undefined) return 'N/A';
    return `${lux.toFixed(2)} Lux`;
};

// Format relay status
export const formatRelayStatus = (status) => {
    return status === 'ON' || status === 1 ? 'ON' : 'OFF';
};

// Get status color
export const getStatusColor = (status) => {
    return status === 'ON' || status === 1 ? '#4caf50' : '#f44336';
};

// Get Lux level description
export const getLuxLevel = (lux) => {
    if (lux < 10) return { level: 'Sangat Gelap', color: '#1a237e' };
    if (lux < 50) return { level: 'Gelap', color: '#283593' };
    if (lux < 200) return { level: 'Redup', color: '#5c6bc0' };
    if (lux < 500) return { level: 'Normal', color: '#42a5f5' };
    if (lux < 1000) return { level: 'Terang', color: '#ffa726' };
    return { level: 'Sangat Terang', color: '#ff6f00' };
};
