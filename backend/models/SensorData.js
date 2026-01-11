module.exports = (sequelize, DataTypes) => {
    const SensorData = sequelize.define('SensorData', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        lux: {
            type: DataTypes.FLOAT,
            allowNull: false,
            comment: 'Light intensity in Lux from BH1750 sensor'
        },
        relay_status: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: 'Relay status: true=ON (lampu nyala), false=OFF (lampu mati)'
        },
        mode: {
            type: DataTypes.ENUM('auto', 'manual'),
            allowNull: false,
            defaultValue: 'auto',
            comment: 'Control mode: auto (twilight switch) or manual'
        },
        threshold_low: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 100,
            comment: 'Lux threshold untuk nyalakan lampu (gelap)'
        },
        threshold_high: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 500,
            comment: 'Lux threshold untuk matikan lampu (terang)'
        },
        manual_relay_state: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: 'Manual relay state untuk mode MANUAL'
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'sensor_data',
        timestamps: true
    });

    return SensorData;
};
