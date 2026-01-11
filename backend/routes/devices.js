const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const { authenticate, isAdmin } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticate);

// GET /api/devices - Get all devices
router.get('/', deviceController.getAllDevices);

// GET /api/devices/:id - Get device by ID
router.get('/:id', deviceController.getDeviceById);

// POST /api/devices - Create new device (admin only)
router.post('/', isAdmin, deviceController.createDevice);

// PUT /api/devices/:id - Update device (admin only)
router.put('/:id', isAdmin, deviceController.updateDevice);

// DELETE /api/devices/:id - Delete device (admin only)
router.delete('/:id', isAdmin, deviceController.deleteDevice);

module.exports = router;
