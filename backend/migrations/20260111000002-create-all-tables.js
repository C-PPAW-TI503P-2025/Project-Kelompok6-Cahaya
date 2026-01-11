'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Create users table
        await queryInterface.createTable('users', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            email: {
                type: Sequelize.STRING(100),
                allowNull: false,
                unique: true
            },
            password: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            role: {
                type: Sequelize.ENUM('admin', 'user'),
                defaultValue: 'user'
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
            }
        });

        // Create devices table
        await queryInterface.createTable('devices', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            device_id: {
                type: Sequelize.STRING(50),
                allowNull: false,
                unique: true
            },
            location: {
                type: Sequelize.STRING(200)
            },
            status: {
                type: Sequelize.ENUM('active', 'inactive'),
                defaultValue: 'active'
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
            }
        });

        // Create device_settings table
        await queryInterface.createTable('device_settings', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            device_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'devices',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            threshold: {
                type: Sequelize.INTEGER,
                defaultValue: 200,
                comment: 'Threshold cahaya dalam Lux'
            },
            mode: {
                type: Sequelize.ENUM('AUTO', 'MANUAL'),
                defaultValue: 'AUTO'
            },
            relay_status: {
                type: Sequelize.ENUM('ON', 'OFF'),
                defaultValue: 'OFF'
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
            }
        });

        // Create relay_logs table
        await queryInterface.createTable('relay_logs', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            device_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'devices',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            status: {
                type: Sequelize.ENUM('ON', 'OFF'),
                allowNull: false
            },
            mode: {
                type: Sequelize.ENUM('AUTO', 'MANUAL'),
                allowNull: false
            },
            triggered_by: {
                type: Sequelize.STRING(50),
                comment: 'AUTO or user_id'
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Create notifications table
        await queryInterface.createTable('notifications', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            user_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            title: {
                type: Sequelize.STRING(200),
                allowNull: false
            },
            message: {
                type: Sequelize.TEXT
            },
            type: {
                type: Sequelize.ENUM('info', 'warning', 'error'),
                defaultValue: 'info'
            },
            is_read: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Insert default admin user (password: "password")
        await queryInterface.bulkInsert('users', [{
            name: 'Admin',
            email: 'admin@twilight.com',
            password: '$2b$10$a97ACiKb9aGxtamSW6b82.sHa2F7d7SuNcdH/43nNqpDeI2Ke9kmW', // bcrypt hash of "password"
            role: 'admin',
            createdAt: new Date(),
            updatedAt: new Date()
        }]);

        // Insert default device
        await queryInterface.bulkInsert('devices', [{
            name: 'ESP32 Device 1',
            device_id: 'ESP32_001',
            location: 'Ruang Utama',
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
        }]);

        // Insert default device settings
        await queryInterface.bulkInsert('device_settings', [{
            device_id: 1,
            threshold: 200,
            mode: 'AUTO',
            relay_status: 'OFF',
            createdAt: new Date(),
            updatedAt: new Date()
        }]);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('notifications');
        await queryInterface.dropTable('relay_logs');
        await queryInterface.dropTable('device_settings');
        await queryInterface.dropTable('devices');
        await queryInterface.dropTable('users');
    }
};
