-- Migration: Add manual_relay_state column and update mode enum
-- Database: iot_esp32
-- Date: 2026-01-10

USE iot_esp32;

-- 1. Tambah kolom manual_relay_state
ALTER TABLE sensor_data 
ADD COLUMN manual_relay_state TINYINT(1) NOT NULL DEFAULT 0 
COMMENT 'Manual relay state untuk mode MANUAL' 
AFTER threshold_high;

-- 2. Update mode enum dari 'AUTO','MANUAL' ke 'auto','manual'
ALTER TABLE sensor_data 
MODIFY COLUMN mode ENUM('auto', 'manual') NOT NULL DEFAULT 'auto'
COMMENT 'Control mode: auto (twilight switch) or manual';

-- 3. Update default threshold_low dari 300 ke 100
ALTER TABLE sensor_data 
MODIFY COLUMN threshold_low INT NOT NULL DEFAULT 100
COMMENT 'Lux threshold untuk nyalakan lampu (gelap)';

-- 4. Update existing data: ubah mode 'AUTO' ke 'auto' dan 'MANUAL' ke 'manual'
UPDATE sensor_data SET mode = 'auto' WHERE mode = 'AUTO';
UPDATE sensor_data SET mode = 'manual' WHERE mode = 'MANUAL';

-- Verifikasi
SELECT * FROM sensor_data ORDER BY createdAt DESC LIMIT 5;
