-- =====================================================
-- DATABASE SETUP untuk BH1750 Twilight Switch
-- =====================================================
-- Jalankan script ini di MySQL Workbench
-- =====================================================

-- 1. Hapus database lama jika ada (HATI-HATI: ini akan menghapus semua data!)
DROP DATABASE IF EXISTS iot_esp32;

-- 2. Buat database baru
CREATE DATABASE iot_esp32
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- 3. Gunakan database yang baru dibuat
USE iot_esp32;

-- 4. Buat tabel sensor_data untuk BH1750 Twilight Switch
CREATE TABLE sensor_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Data dari sensor BH1750
  lux FLOAT NOT NULL COMMENT 'Light intensity in Lux from BH1750 sensor',
  
  -- Status relay (lampu)
  relay_status BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Relay status: true=ON (lampu nyala), false=OFF (lampu mati)',
  
  -- Mode kontrol
  mode ENUM('AUTO', 'MANUAL') NOT NULL DEFAULT 'AUTO' COMMENT 'Control mode: AUTO (twilight switch) or MANUAL',
  
  -- Threshold untuk twilight switch
  threshold_low INT NOT NULL DEFAULT 300 COMMENT 'Lux threshold untuk nyalakan lampu (gelap)',
  threshold_high INT NOT NULL DEFAULT 500 COMMENT 'Lux threshold untuk matikan lampu (terang)',
  
  -- Timestamps
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes untuk performa query
  INDEX idx_createdAt (createdAt),
  INDEX idx_relay_status (relay_status),
  INDEX idx_mode (mode)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Insert data sample untuk testing (opsional)
INSERT INTO sensor_data (lux, relay_status, mode, threshold_low, threshold_high) VALUES
  (150.5, TRUE, 'AUTO', 300, 500),   -- Gelap, lampu ON
  (450.2, TRUE, 'AUTO', 300, 500),   -- Masih agak gelap
  (550.8, FALSE, 'AUTO', 300, 500),  -- Terang, lampu OFF
  (1200.0, FALSE, 'AUTO', 300, 500), -- Sangat terang
  (250.3, TRUE, 'AUTO', 300, 500);   -- Gelap lagi

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
