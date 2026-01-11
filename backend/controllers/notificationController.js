const { Notification } = require('../models');

const notificationController = {
    // Get all notifications for current user
    getAllNotifications: async (req, res) => {
        try {
            const notifications = await Notification.findAll({
                where: { user_id: req.user.id },
                order: [['createdAt', 'DESC']]
            });

            res.json({
                success: true,
                data: notifications
            });
        } catch (error) {
            console.error('Error getting notifications:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan saat mengambil notifikasi',
                error: error.message
            });
        }
    },

    // Create notification (system/admin)
    createNotification: async (req, res) => {
        try {
            const { user_id, title, message, type } = req.body;

            if (!user_id || !title || !message) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID, title, dan message harus diisi'
                });
            }

            const notification = await Notification.create({
                user_id,
                title,
                message,
                type: type || 'info',
                is_read: false
            });

            res.status(201).json({
                success: true,
                message: 'Notifikasi berhasil dibuat',
                data: notification
            });
        } catch (error) {
            console.error('Error creating notification:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan saat membuat notifikasi',
                error: error.message
            });
        }
    },

    // Mark notification as read
    markAsRead: async (req, res) => {
        try {
            const { id } = req.params;

            const notification = await Notification.findOne({
                where: {
                    id,
                    user_id: req.user.id
                }
            });

            if (!notification) {
                return res.status(404).json({
                    success: false,
                    message: 'Notifikasi tidak ditemukan'
                });
            }

            await notification.update({ is_read: true });

            res.json({
                success: true,
                message: 'Notifikasi ditandai sebagai sudah dibaca',
                data: notification
            });
        } catch (error) {
            console.error('Error marking notification as read:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan saat mengupdate notifikasi',
                error: error.message
            });
        }
    },

    // Delete notification
    deleteNotification: async (req, res) => {
        try {
            const { id } = req.params;

            const notification = await Notification.findOne({
                where: {
                    id,
                    user_id: req.user.id
                }
            });

            if (!notification) {
                return res.status(404).json({
                    success: false,
                    message: 'Notifikasi tidak ditemukan'
                });
            }

            await notification.destroy();

            res.json({
                success: true,
                message: 'Notifikasi berhasil dihapus'
            });
        } catch (error) {
            console.error('Error deleting notification:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan saat menghapus notifikasi',
                error: error.message
            });
        }
    },

    // Mark all notifications as read
    markAllAsRead: async (req, res) => {
        try {
            await Notification.update(
                { is_read: true },
                { where: { user_id: req.user.id, is_read: false } }
            );

            res.json({
                success: true,
                message: 'Semua notifikasi ditandai sebagai sudah dibaca'
            });
        } catch (error) {
            console.error('Error marking all as read:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan saat mengupdate notifikasi',
                error: error.message
            });
        }
    }
};

module.exports = notificationController;
