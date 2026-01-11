const express = require('express');
const router = express.Router();
const iotController = require('../controllers/iotController');

/**
 * Routes untuk BH1750 Twilight Switch
 */

// POST /api/iot/ping - Endpoint untuk ESP32 mengirim data sensor BH1750 (legacy)
router.post('/ping', iotController.receiveSensorData);

// POST /api/iot/data - Endpoint untuk ESP32 mengirim data sensor BH1750 (new)
router.post('/data', iotController.receiveSensorData);

// GET /api/iot/data - Get semua data sensor dengan pagination
router.get('/data', iotController.getAllSensorData);

// GET /api/iot/latest - Get data sensor terbaru
router.get('/latest', iotController.getLatestSensorData);

// GET /api/iot/data/range - Get data berdasarkan range waktu
router.get('/data/range', iotController.getSensorDataByDateRange);

// GET /api/iot/stats - Get statistik data sensor
router.get('/stats', iotController.getSensorStats);

// GET /api/iot/settings - Get current settings (mode, threshold)
router.get('/settings', iotController.getSettings);

// PUT /api/iot/settings - Update settings (mode, threshold)
router.put('/settings', iotController.updateSettings);

// POST /api/iot/relay - Manual relay control (hanya untuk mode MANUAL)
router.post('/relay', iotController.controlRelay);

module.exports = router;
