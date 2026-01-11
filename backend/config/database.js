require('dotenv').config();

module.exports = {
    development: {
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'iot_esp32',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3309,
        dialect: process.env.DB_DIALECT || 'mysql',
        logging: false,
        timezone: '+07:00'
    },
    test: {
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME + '_test' || 'iot_esp32_test',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3309,
        dialect: process.env.DB_DIALECT || 'mysql',
        logging: false,
        timezone: '+07:00'
    },
    production: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3309,
        dialect: process.env.DB_DIALECT || 'mysql',
        logging: false,
        timezone: '+07:00'
    }
};
