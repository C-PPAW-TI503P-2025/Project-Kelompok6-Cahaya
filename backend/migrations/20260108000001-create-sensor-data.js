'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('sensor_data', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            lux: {
                type: Sequelize.FLOAT,
                allowNull: false,
                comment: 'Light intensity in Lux from BH1750 sensor'
            },
            relay_status: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                comment: 'Relay status: true=ON (lampu nyala), false=OFF (lampu mati)'
            },
            mode: {
                type: Sequelize.ENUM('AUTO', 'MANUAL'),
                allowNull: false,
                defaultValue: 'AUTO',
                comment: 'Control mode: AUTO (twilight switch) or MANUAL'
            },
            threshold_low: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 300,
                comment: 'Lux threshold untuk nyalakan lampu (gelap)'
            },
            threshold_high: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 500,
                comment: 'Lux threshold untuk matikan lampu (terang)'
            },
            manual_relay_state: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                comment: 'Manual relay state untuk mode MANUAL'
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

        // Add indexes for faster queries
        await queryInterface.addIndex('sensor_data', ['createdAt']);
        await queryInterface.addIndex('sensor_data', ['relay_status']);
        await queryInterface.addIndex('sensor_data', ['mode']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('sensor_data');
    }
};
