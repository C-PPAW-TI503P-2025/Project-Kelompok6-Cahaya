require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

// ===== MIDDLEWARE =====
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS untuk semua origin
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded body

// ===== ROUTES =====
const iotRoutes = require('./routes/iot');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const deviceRoutes = require('./routes/devices');
const notificationRoutes = require('./routes/notifications');

app.use('/api/iot', iotRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/notifications', notificationRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'IoT BH1750 Twilight Switch Backend API',
        version: '2.0.0',
        description: 'Backend untuk BH1750 Luxmeter dengan Relay Control',
        endpoints: {
            sensorData: {
                ping: 'POST /api/iot/ping - ESP32 kirim data lux & relay status',
                getAllData: 'GET /api/iot/data?page=1&limit=10 - Get all data',
                getLatest: 'GET /api/iot/latest - Get data terbaru',
                getByDateRange: 'GET /api/iot/data/range?start=2026-01-01&end=2026-01-08',
                getStats: 'GET /api/iot/stats - Statistik lux & relay'
            },
            control: {
                getSettings: 'GET /api/iot/settings - Get mode & threshold',
                updateSettings: 'PUT /api/iot/settings - Update mode/threshold',
                controlRelay: 'POST /api/iot/relay - Manual relay control'
            }
        },
        twilightLogic: {
            threshold_low: '300 lux (gelap → lampu ON)',
            threshold_high: '500 lux (terang → lampu OFF)',
            modes: ['AUTO (twilight switch)', 'MANUAL (kontrol manual)']
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint tidak ditemukan'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ===== DATABASE CONNECTION & SERVER START =====
const startServer = async () => {
    try {
        // Test database connection
        await sequelize.authenticate();
        console.log('✅ Database connected successfully');

        // Sync models (development only)
        if (process.env.NODE_ENV === 'development') {
            await sequelize.sync({ alter: false });
            console.log('✅ Database models synced');
        }

        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📡 ESP32 endpoint: http://localhost:${PORT}/api/iot/ping`);
            console.log(`💡 Twilight Switch: BH1750 Luxmeter + Relay Control`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        });

    } catch (error) {
        console.error('❌ Unable to start server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;
