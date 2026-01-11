/**
 * Migration Script: Add manual_relay_state column
 * Run: node migrations/run_migration.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function runMigration() {
    let connection;

    try {
        // Create connection
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'twilight_switch'
        });

        console.log('✅ Connected to database');

        // 1. Add manual_relay_state column
        console.log('\n📝 Adding manual_relay_state column...');
        await connection.execute(`
            ALTER TABLE sensor_data 
            ADD COLUMN IF NOT EXISTS manual_relay_state TINYINT(1) NOT NULL DEFAULT 0 
            COMMENT 'Manual relay state untuk mode MANUAL' 
            AFTER threshold_high
        `);
        console.log('✅ Column manual_relay_state added');

        // 2. Update mode enum (drop and recreate)
        console.log('\n📝 Updating mode enum...');
        try {
            await connection.execute(`
                ALTER TABLE sensor_data 
                MODIFY COLUMN mode ENUM('auto', 'manual') NOT NULL DEFAULT 'auto'
            `);
            console.log('✅ Mode enum updated to lowercase');
        } catch (error) {
            if (error.code === 'ER_TRUNCATED_WRONG_VALUE') {
                console.log('⚠️  Need to update existing data first...');
                // Update existing data
                await connection.execute(`UPDATE sensor_data SET mode = 'AUTO' WHERE mode = 'auto'`);
                await connection.execute(`UPDATE sensor_data SET mode = 'MANUAL' WHERE mode = 'manual'`);
                // Try again
                await connection.execute(`
                    ALTER TABLE sensor_data 
                    MODIFY COLUMN mode ENUM('auto', 'manual') NOT NULL DEFAULT 'auto'
                `);
                console.log('✅ Mode enum updated');
            } else {
                throw error;
            }
        }

        // 3. Update default threshold_low
        console.log('\n📝 Updating threshold_low default...');
        await connection.execute(`
            ALTER TABLE sensor_data 
            MODIFY COLUMN threshold_low INT NOT NULL DEFAULT 100
        `);
        console.log('✅ Threshold_low default updated to 100');

        // 4. Verify
        console.log('\n📊 Verifying changes...');
        const [rows] = await connection.execute(`
            SHOW COLUMNS FROM sensor_data LIKE 'manual_relay_state'
        `);

        if (rows.length > 0) {
            console.log('✅ manual_relay_state column exists:', rows[0]);
        }

        const [modeInfo] = await connection.execute(`
            SHOW COLUMNS FROM sensor_data LIKE 'mode'
        `);
        console.log('✅ mode column:', modeInfo[0].Type);

        console.log('\n🎉 Migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('Error code:', error.code);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n✅ Database connection closed');
        }
    }
}

// Run migration
runMigration();
