const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, isAdmin } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticate);

// GET /api/users - Get all users (admin only)
router.get('/', isAdmin, userController.getAllUsers);

// GET /api/users/:id - Get user by ID
router.get('/:id', userController.getUserById);

// POST /api/users - Create new user (admin only)
router.post('/', isAdmin, userController.createUser);

// PUT /api/users/:id - Update user (admin only)
router.put('/:id', isAdmin, userController.updateUser);

// DELETE /api/users/:id - Delete user (admin only)
router.delete('/:id', isAdmin, userController.deleteUser);

module.exports = router;
