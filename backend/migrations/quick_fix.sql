-- =====================================================
-- DATABASE SETUP untuk BH1750 Twilight Switch (UPDATED)
-- =====================================================
-- Jalankan script ini di MySQL Workbench atau phpMyAdmin
-- =====================================================

-- 1. Gunakan database yang sudah ada
USE iot_esp32;

-- 2. Tambah kolom manual_relay_state (jika belum ada)
ALTER TABLE sensor_data 
ADD COLUMN IF NOT EXISTS manual_relay_state TINYINT(1) NOT NULL DEFAULT 0 
COMMENT 'Manual relay state untuk mode MANUAL' 
AFTER threshold_high;

-- 3. Update mode enum ke lowercase (auto, manual)
-- Cara aman: backup data dulu, lalu modify
ALTER TABLE sensor_data 
MODIFY COLUMN mode ENUM('auto', 'manual') NOT NULL DEFAULT 'auto'
COMMENT 'Control mode: auto (twilight switch) or manual';

-- 4. Update default threshold_low ke 100
ALTER TABLE sensor_data 
MODIFY COLUMN threshold_low INT NOT NULL DEFAULT 100
COMMENT 'Lux threshold untuk nyalakan lampu (gelap)';

-- 5. Verifikasi perubahan
DESCRIBE sensor_data;

-- 6. Lihat data terbaru
SELECT * FROM sensor_data ORDER BY createdAt DESC LIMIT 5;

-- =====================================================
-- SELESAI! Database sudah diupdate
-- =====================================================
