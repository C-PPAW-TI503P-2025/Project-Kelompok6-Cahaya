const { Device } = require('../models');

const deviceController = {
    // Get all devices
    getAllDevices: async (req, res) => {
        try {
            const devices = await Device.findAll({
                order: [['createdAt', 'DESC']]
            });

            res.json({
                success: true,
                data: devices
            });
        } catch (error) {
            console.error('Error getting devices:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan saat mengambil data devices',
                error: error.message
            });
        }
    },

    // Get device by ID
    getDeviceById: async (req, res) => {
        try {
            const { id } = req.params;

            const device = await Device.findByPk(id);

            if (!device) {
                return res.status(404).json({
                    success: false,
                    message: 'Device tidak ditemukan'
                });
            }

            res.json({
                success: true,
                data: device
            });
        } catch (error) {
            console.error('Error getting device:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan saat mengambil data device',
                error: error.message
            });
        }
    },

    // Create new device (admin only)
    createDevice: async (req, res) => {
        try {
            const { name, device_id, location, status } = req.body;

            // Validation
            if (!name || !device_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Nama dan device ID harus diisi'
                });
            }

            // Check if device_id already exists
            const existingDevice = await Device.findOne({ where: { device_id } });
            if (existingDevice) {
                return res.status(409).json({
                    success: false,
                    message: 'Device ID sudah terdaftar'
                });
            }

            // Create device
            const device = await Device.create({
                name,
                device_id,
                location: location || null,
                status: status || 'active'
            });

            res.status(201).json({
                success: true,
                message: 'Device berhasil dibuat',
                data: device
            });
        } catch (error) {
            console.error('Error creating device:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan saat membuat device',
                error: error.message
            });
        }
    },

    // Update device (admin only)
    updateDevice: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, device_id, location, status } = req.body;

            const device = await Device.findByPk(id);

            if (!device) {
                return res.status(404).json({
                    success: false,
                    message: 'Device tidak ditemukan'
                });
            }

            // Check if device_id is being changed and already exists
            if (device_id && device_id !== device.device_id) {
                const existingDevice = await Device.findOne({ where: { device_id } });
                if (existingDevice) {
                    return res.status(409).json({
                        success: false,
                        message: 'Device ID sudah digunakan oleh device lain'
                    });
                }
            }

            // Update fields
            const updateData = {};
            if (name) updateData.name = name;
            if (device_id) updateData.device_id = device_id;
            if (location !== undefined) updateData.location = location;
            if (status) updateData.status = status;

            await device.update(updateData);

            res.json({
                success: true,
                message: 'Device berhasil diupdate',
                data: device
            });
        } catch (error) {
            console.error('Error updating device:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan saat mengupdate device',
                error: error.message
            });
        }
    },

    // Delete device (admin only)
    deleteDevice: async (req, res) => {
        try {
            const { id } = req.params;

            const device = await Device.findByPk(id);

            if (!device) {
                return res.status(404).json({
                    success: false,
                    message: 'Device tidak ditemukan'
                });
            }

            await device.destroy();

            res.json({
                success: true,
                message: 'Device berhasil dihapus'
            });
        } catch (error) {
            console.error('Error deleting device:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan saat menghapus device',
                error: error.message
            });
        }
    }
};

module.exports = deviceController;
