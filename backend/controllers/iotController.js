const { SensorData } = require('../models');
const { Op } = require('sequelize');

/**
 * Controller untuk BH1750 Twilight Switch
 */
const iotController = {

    /**
     * Endpoint untuk menerima data sensor BH1750 dari ESP32
     * POST /api/iot/data atau /api/iot/ping
     * Body: { lux, relay_status }
     */
    async receiveSensorData(req, res) {
        try {
            const { lux, relay_status } = req.body;

            // Validasi data
            if (lux === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Data tidak lengkap. Diperlukan: lux'
                });
            }

            // Get latest settings (threshold & mode)
            const latestSettings = await SensorData.findOne({
                order: [['createdAt', 'DESC']],
                attributes: ['mode', 'threshold_low', 'threshold_high', 'manual_relay_state']
            });

            const mode = latestSettings?.mode || 'auto';
            const lux_threshold = latestSettings?.threshold_low || 100;  // Gunakan threshold_low sebagai threshold utama
            const manual_relay_state = latestSettings?.manual_relay_state || false;

            // ===== LOGIKA TWILIGHT SWITCH =====
            let relay_state = false;

            if (mode === 'auto') {
                // MODE AUTO: Relay ON jika GELAP (lux < threshold), OFF jika TERANG
                relay_state = lux < lux_threshold;
                console.log(`🌙 AUTO Mode: Lux=${lux}, Threshold=${lux_threshold} → Relay=${relay_state ? 'ON (GELAP)' : 'OFF (TERANG)'}`);
            } else {
                // MODE MANUAL: Relay mengikuti manual_relay_state
                relay_state = manual_relay_state;
                console.log(`🔧 MANUAL Mode: Relay=${relay_state ? 'ON' : 'OFF'} (manual control)`);
            }

            // Simpan data ke database
            const sensorData = await SensorData.create({
                lux: parseFloat(lux),
                relay_status: relay_state,  // Simpan relay state yang sudah dihitung
                mode,
                threshold_low: lux_threshold,
                threshold_high: latestSettings?.threshold_high || 500,
                manual_relay_state
            });

            console.log(`✅ Data saved: Lux=${lux}, Relay=${relay_state ? 'ON' : 'OFF'}, Mode=${mode}`);

            // ===== KIRIM PERINTAH RELAY KE ESP32 =====
            return res.status(201).json({
                success: true,
                message: 'Data sensor berhasil disimpan',
                data: sensorData,
                relay_state: relay_state,  // ESP32 akan baca ini untuk update relay
                mode: mode,
                lux_threshold: lux_threshold,
                manual_relay_state: manual_relay_state
            });

        } catch (error) {
            console.error('❌ Error menyimpan data sensor:', error);
            return res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan saat menyimpan data',
                error: error.message
            });
        }
    },

    /**
     * Get semua data sensor dengan pagination
     * GET /api/iot/data?page=1&limit=10
     */
    async getAllSensorData(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            const { count, rows } = await SensorData.findAndCountAll({
                limit,
                offset,
                order: [['createdAt', 'DESC']]
            });

            return res.status(200).json({
                success: true,
                data: rows,
                pagination: {
                    total: count,
                    page,
                    limit,
                    totalPages: Math.ceil(count / limit)
                }
            });

        } catch (error) {
            console.error('❌ Error mengambil data sensor:', error);
            return res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan saat mengambil data',
                error: error.message
            });
        }
    },

    /**
     * Get data sensor terbaru
     * GET /api/iot/latest
     */
    async getLatestSensorData(req, res) {
        try {
            const latestData = await SensorData.findOne({
                order: [['createdAt', 'DESC']]
            });

            if (!latestData) {
                return res.status(404).json({
                    success: false,
                    message: 'Belum ada data sensor'
                });
            }

            return res.status(200).json({
                success: true,
                data: latestData
            });

        } catch (error) {
            console.error('❌ Error mengambil data terbaru:', error);
            return res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan saat mengambil data',
                error: error.message
            });
        }
    },

    /**
     * Get data sensor berdasarkan range waktu
     * GET /api/iot/data/range?start=2026-01-01&end=2026-01-08
     */
    async getSensorDataByDateRange(req, res) {
        try {
            const { start, end } = req.query;

            if (!start || !end) {
                return res.status(400).json({
                    success: false,
                    message: 'Parameter start dan end diperlukan'
                });
            }

            const data = await SensorData.findAll({
                where: {
                    createdAt: {
                        [Op.between]: [new Date(start), new Date(end)]
                    }
                },
                order: [['createdAt', 'DESC']]
            });

            return res.status(200).json({
                success: true,
                count: data.length,
                data
            });

        } catch (error) {
            console.error('❌ Error mengambil data berdasarkan range:', error);
            return res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan saat mengambil data',
                error: error.message
            });
        }
    },

    /**
     * Get statistik data sensor
     * GET /api/iot/stats
     */
    async getSensorStats(req, res) {
        try {
            const { sequelize } = require('../models');

            const stats = await SensorData.findOne({
                attributes: [
                    [sequelize.fn('AVG', sequelize.col('lux')), 'avgLux'],
                    [sequelize.fn('MAX', sequelize.col('lux')), 'maxLux'],
                    [sequelize.fn('MIN', sequelize.col('lux')), 'minLux'],
                    [sequelize.fn('COUNT', sequelize.col('id')), 'totalRecords']
                ],
                raw: true
            });

            const relayStats = await SensorData.findAll({
                attributes: [
                    'relay_status',
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                ],
                group: ['relay_status'],
                raw: true
            });

            const modeStats = await SensorData.findAll({
                attributes: [
                    'mode',
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                ],
                group: ['mode'],
                raw: true
            });

            return res.status(200).json({
                success: true,
                stats,
                relayDistribution: relayStats,
                modeDistribution: modeStats
            });

        } catch (error) {
            console.error('❌ Error mengambil statistik:', error);
            return res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan saat mengambil statistik',
                error: error.message
            });
        }
    },

    /**
     * Get current settings
     * GET /api/iot/settings
     */
    async getSettings(req, res) {
        try {
            const latestData = await SensorData.findOne({
                order: [['createdAt', 'DESC']],
                attributes: ['mode', 'threshold_low', 'threshold_high', 'relay_status', 'lux', 'manual_relay_state']
            });

            if (!latestData) {
                return res.status(200).json({
                    success: true,
                    data: {
                        mode: 'auto',
                        lux_threshold: 100,
                        manual_relay_state: false
                    }
                });
            }

            return res.status(200).json({
                success: true,
                data: {
                    mode: latestData.mode,
                    lux_threshold: latestData.threshold_low,
                    manual_relay_state: latestData.manual_relay_state || false
                }
            });

        } catch (error) {
            console.error('❌ Error get settings:', error);
            return res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan saat mengambil settings',
                error: error.message
            });
        }
    },

    /**
     * Update mode dan threshold
     * PUT /api/iot/settings
     * Body: { mode, threshold, manual_relay_state }
     */
    async updateSettings(req, res) {
        try {
            const { mode, threshold, manual_relay_state } = req.body;

            // Validasi mode
            if (mode && !['auto', 'manual'].includes(mode.toLowerCase())) {
                return res.status(400).json({
                    success: false,
                    message: 'Mode harus auto atau manual'
                });
            }

            // Get latest data untuk update
            const latestData = await SensorData.findOne({
                order: [['createdAt', 'DESC']]
            });

            if (!latestData) {
                return res.status(404).json({
                    success: false,
                    message: 'Tidak ada data sensor. Tunggu ESP32 mengirim data pertama.'
                });
            }

            // Prepare updated settings
            const newMode = mode ? mode.toLowerCase() : latestData.mode;
            const newThreshold = threshold !== undefined ? threshold : latestData.threshold_low;
            const newManualRelayState = manual_relay_state !== undefined ? manual_relay_state : latestData.manual_relay_state;

            // Create new record with updated settings
            const updatedData = await SensorData.create({
                lux: latestData.lux,
                relay_status: newMode === 'manual' ? newManualRelayState : latestData.relay_status,
                mode: newMode,
                threshold_low: newThreshold,
                threshold_high: latestData.threshold_high || 500,
                manual_relay_state: newManualRelayState
            });

            console.log(`⚙️ Settings updated: Mode=${newMode}, Threshold=${newThreshold}, Manual=${newManualRelayState}`);

            return res.status(200).json({
                success: true,
                message: 'Settings berhasil diupdate',
                data: {
                    mode: updatedData.mode,
                    lux_threshold: updatedData.threshold_low,
                    manual_relay_state: updatedData.manual_relay_state
                }
            });

        } catch (error) {
            console.error('❌ Error update settings:', error);
            return res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan saat update settings',
                error: error.message
            });
        }
    },

    /**
     * Manual relay control
     * POST /api/iot/relay
     * Body: { status: true/false }
     */
    async controlRelay(req, res) {
        try {
            const { status } = req.body;

            if (status === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Parameter status diperlukan (true/false)'
                });
            }

            // Get latest settings
            const latestData = await SensorData.findOne({
                order: [['createdAt', 'DESC']]
            });

            if (!latestData) {
                return res.status(404).json({
                    success: false,
                    message: 'Tidak ada data sensor. Tunggu ESP32 mengirim data pertama.'
                });
            }

            // Jika mode AUTO, tidak bisa manual control
            if (latestData.mode === 'auto') {
                return res.status(400).json({
                    success: false,
                    message: 'Tidak bisa kontrol manual saat mode AUTO. Ubah ke mode MANUAL dulu.'
                });
            }

            console.log(`🔌 Manual relay control: ${status ? 'ON' : 'OFF'}`);

            // Create new record with updated relay status
            const updatedData = await SensorData.create({
                lux: latestData.lux,
                relay_status: status,
                mode: 'manual', // Ensure mode is manual
                threshold_low: latestData.threshold_low,
                threshold_high: latestData.threshold_high || 500,
                manual_relay_state: status
            });

            console.log(`✅ Relay state saved to DB: ${status ? 'ON' : 'OFF'}`);

            return res.status(200).json({
                success: true,
                message: `Relay ${status ? 'ON' : 'OFF'}`,
                data: {
                    relay_status: updatedData.relay_status,
                    mode: updatedData.mode,
                    lux: updatedData.lux
                }
            });

        } catch (error) {
            console.error('❌ Error kontrol relay:', error);
            return res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan saat kontrol relay',
                error: error.message
            });
        }
    },

    /**
     * Get statistics summary
     * GET /api/iot/statistics
     */
    async getStatistics(req, res) {
        try {
            const { startDate, endDate } = req.query;

            const whereClause = {};
            if (startDate && endDate) {
                whereClause.createdAt = {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                };
            }

            const data = await SensorData.findAll({
                where: whereClause,
                order: [['createdAt', 'DESC']]
            });

            const totalRecords = data.length;
            const avgIntensity = data.reduce((sum, item) => sum + item.lux, 0) / totalRecords || 0;
            const autoActivations = data.filter(item => item.mode === 'auto' && item.relay_status).length;
            const manualActivations = data.filter(item => item.mode === 'manual' && item.relay_status).length;

            return res.status(200).json({
                success: true,
                data: {
                    totalRecords,
                    avgIntensity: parseFloat(avgIntensity.toFixed(2)),
                    autoActivations,
                    manualActivations
                }
            });

        } catch (error) {
            console.error('Error getting statistics:', error);
            return res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan saat mengambil statistik',
                error: error.message
            });
        }
    },

    /**
     * Get activity log
     * GET /api/iot/activity
     */
    async getActivityLog(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 10;

            const data = await SensorData.findAll({
                limit,
                order: [['createdAt', 'DESC']]
            });

            const activityLog = data.map(item => {
                let action = '';
                let status = 'info';

                if (item.mode === 'auto') {
                    action = item.relay_status ? 'Relay dinyalakan otomatis' : 'Relay dimatikan otomatis';
                    status = 'success';
                } else {
                    action = item.relay_status ? 'Relay dinyalakan manual' : 'Mode diubah ke MANUAL';
                    status = 'info';
                }

                return {
                    time: new Date(item.createdAt).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    action,
                    status,
                    timestamp: item.createdAt
                };
            });

            return res.status(200).json({
                success: true,
                data: activityLog
            });

        } catch (error) {
            console.error('Error getting activity log:', error);
            return res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan saat mengambil activity log',
                error: error.message
            });
        }
    },

    /**
     * Clear all history data
     * DELETE /api/iot/history
     */
    async clearHistory(req, res) {
        try {
            const latestData = await SensorData.findOne({
                order: [['createdAt', 'DESC']]
            });

            if (latestData) {
                await SensorData.destroy({
                    where: {
                        id: {
                            [Op.ne]: latestData.id
                        }
                    }
                });
            }

            console.log('🗑️ History cleared');

            return res.status(200).json({
                success: true,
                message: 'Riwayat data berhasil dihapus'
            });

        } catch (error) {
            console.error('Error clearing history:', error);
            return res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan saat menghapus riwayat',
                error: error.message
            });
        }
    }

};

module.exports = iotController;
