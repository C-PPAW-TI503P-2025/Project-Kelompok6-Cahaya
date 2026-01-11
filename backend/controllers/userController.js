const { User } = require('../models');
const bcrypt = require('bcryptjs');

const userController = {
    // Get all users (admin only)
    getAllUsers: async (req, res) => {
        try {
            const users = await User.findAll({
                attributes: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'],
                order: [['createdAt', 'DESC']]
            });

            res.json({
                success: true,
                data: users
            });
        } catch (error) {
            console.error('Error getting users:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan saat mengambil data users',
                error: error.message
            });
        }
    },

    // Get user by ID
    getUserById: async (req, res) => {
        try {
            const { id } = req.params;

            const user = await User.findByPk(id, {
                attributes: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt']
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User tidak ditemukan'
                });
            }

            res.json({
                success: true,
                data: user
            });
        } catch (error) {
            console.error('Error getting user:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan saat mengambil data user',
                error: error.message
            });
        }
    },

    // Create new user (admin only)
    createUser: async (req, res) => {
        try {
            const { name, email, password, role } = req.body;

            // Validation
            if (!name || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Nama, email, dan password harus diisi'
                });
            }

            // Check if email already exists
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'Email sudah terdaftar'
                });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user
            const user = await User.create({
                name,
                email,
                password: hashedPassword,
                role: role || 'user'
            });

            res.status(201).json({
                success: true,
                message: 'User berhasil dibuat',
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan saat membuat user',
                error: error.message
            });
        }
    },

    // Update user (admin only)
    updateUser: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, email, password, role } = req.body;

            const user = await User.findByPk(id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User tidak ditemukan'
                });
            }

            // Check if email is being changed and already exists
            if (email && email !== user.email) {
                const existingUser = await User.findOne({ where: { email } });
                if (existingUser) {
                    return res.status(409).json({
                        success: false,
                        message: 'Email sudah digunakan oleh user lain'
                    });
                }
            }

            // Update fields
            const updateData = {};
            if (name) updateData.name = name;
            if (email) updateData.email = email;
            if (role) updateData.role = role;
            if (password) {
                updateData.password = await bcrypt.hash(password, 10);
            }

            await user.update(updateData);

            res.json({
                success: true,
                message: 'User berhasil diupdate',
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan saat mengupdate user',
                error: error.message
            });
        }
    },

    // Delete user (admin only)
    deleteUser: async (req, res) => {
        try {
            const { id } = req.params;

            // Prevent deleting yourself
            if (parseInt(id) === req.user.id) {
                return res.status(400).json({
                    success: false,
                    message: 'Tidak dapat menghapus akun Anda sendiri'
                });
            }

            const user = await User.findByPk(id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User tidak ditemukan'
                });
            }

            await user.destroy();

            res.json({
                success: true,
                message: 'User berhasil dihapus'
            });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan saat menghapus user',
                error: error.message
            });
        }
    }
};

module.exports = userController;
