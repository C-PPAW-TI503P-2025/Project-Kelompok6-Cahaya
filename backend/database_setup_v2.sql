-- =====================================================
-- DATABASE SETUP untuk BH1750 Twilight Switch v2
-- =====================================================
-- UPDATED: Dengan kolom manual_relay_state dan mode lowercase
-- Jalankan script ini di MySQL Workbench atau phpMyAdmin
-- =====================================================

-- 1. Hapus database lama jika ada (HATI-HATI: ini akan menghapus semua data!)
DROP DATABASE IF EXISTS iot_twilight_switch;

-- 2. Buat database baru
CREATE DATABASE iot_twilight_switch
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- 3. Gunakan database yang baru dibuat
USE iot_twilight_switch;

-- 4. Buat tabel sensor_data untuk BH1750 Twilight Switch
CREATE TABLE sensor_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Data dari sensor BH1750
  lux FLOAT NOT NULL COMMENT 'Light intensity in Lux from BH1750 sensor',
  
  -- Status relay (lampu)
  relay_status BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Relay status: true=ON (lampu nyala), false=OFF (lampu mati)',
  
  -- Mode kontrol (UPDATED: lowercase)
  mode ENUM('auto', 'manual') NOT NULL DEFAULT 'auto' COMMENT 'Control mode: auto (twilight switch) or manual',
  
  -- Threshold untuk twilight switch (UPDATED: default 100)
  threshold_low INT NOT NULL DEFAULT 100 COMMENT 'Lux threshold untuk nyalakan lampu (gelap)',
  threshold_high INT NOT NULL DEFAULT 500 COMMENT 'Lux threshold untuk matikan lampu (terang)',
  
  -- Manual relay state (NEW!)
  manual_relay_state BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Manual relay state untuk mode MANUAL',
  
  -- Timestamps
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes untuk performa query
  INDEX idx_createdAt (createdAt),
  INDEX idx_relay_status (relay_status),
  INDEX idx_mode (mode)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Insert data sample untuk testing (opsional)
INSERT INTO sensor_data (lux, relay_status, mode, threshold_low, threshold_high, manual_relay_state) VALUES
  (50.5, TRUE, 'auto', 100, 500, FALSE),    -- Gelap (< 100), lampu ON
  (80.2, TRUE, 'auto', 100, 500, FALSE),    -- Masih gelap
  (150.8, FALSE, 'auto', 100, 500, FALSE),  -- Terang (> 100), lampu OFF
  (500.0, FALSE, 'auto', 100, 500, FALSE),  -- Sangat terang
  (30.3, TRUE, 'auto', 100, 500, FALSE);    -- Gelap lagi, lampu ON

-- 6. Verifikasi data
SELECT * FROM sensor_data ORDER BY createdAt DESC;

-- 7. Tampilkan struktur tabel
DESCRIBE sensor_data;

-- =====================================================
-- SELESAI! Database siap digunakan
-- =====================================================

-- Query berguna untuk monitoring:

-- Lihat data terbaru
-- SELECT * FROM sensor_data ORDER BY createdAt DESC LIMIT 10;

-- Lihat statistik lux
-- SELECT 
--   AVG(lux) as avg_lux,
--   MAX(lux) as max_lux,
--   MIN(lux) as min_lux,
--   COUNT(*) as total_records
-- FROM sensor_data;

-- Lihat distribusi relay status
-- SELECT 
--   relay_status,
--   COUNT(*) as count
-- FROM sensor_data
-- GROUP BY relay_status;

-- Hapus data lama (lebih dari 7 hari)
-- DELETE FROM sensor_data WHERE createdAt < DATE_SUB(NOW(), INTERVAL 7 DAY);
