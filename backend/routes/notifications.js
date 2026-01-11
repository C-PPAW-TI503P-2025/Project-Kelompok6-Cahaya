const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate, isAdmin } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticate);

// GET /api/notifications - Get all notifications for current user
router.get('/', notificationController.getAllNotifications);

// POST /api/notifications - Create notification (admin only)
router.post('/', isAdmin, notificationController.createNotification);

// PUT /api/notifications/mark-all-read - Mark all as read
router.put('/mark-all-read', notificationController.markAllAsRead);

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', notificationController.markAsRead);

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
