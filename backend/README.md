# 💡 IoT BH1750 Twilight Switch - Backend API

Backend API untuk **BH1750 Luxmeter Twilight Switch** dengan ESP32 dan Relay Control.

> **Twilight Switch** = Lampu otomatis **ON saat gelap**, **OFF saat terang**

---

## 📋 Fitur

- ✅ Menerima data lux dari sensor **BH1750** (luxmeter digital)
- ✅ **Relay control** untuk lampu AC 220V
- ✅ **Mode AUTO** (twilight switch otomatis)
- ✅ **Mode MANUAL** (kontrol relay manual)
- ✅ **Threshold konfigurasi** (kapan lampu ON/OFF)
- ✅ API untuk monitoring dan statistik
- ✅ Menyimpan data ke MySQL database

---

## 🛠️ Teknologi

- **Node.js** & **Express.js** - Backend framework
- **Sequelize** - ORM untuk MySQL
- **MySQL** - Database
- **CORS**, **Helmet**, **Morgan** - Middleware

---

## 🔌 Hardware yang Digunakan

| Komponen           | Spesifikasi                  |
|--------------------|------------------------------|
| ESP32              | ESP32 Dev Module (WROOM-32)  |
| Sensor Cahaya      | BH1750 (GY-302 / GY-30)      |
| Relay              | 1 Channel 5V (Optocoupler)   |
| Lampu              | AC 220V (bohlam / LED)       |
| Breadboard         | MB-102 (Full Size)           |
| Kabel Jumper       | Male-Female (±10 pcs)        |

### Koneksi Pin

**BH1750 → ESP32:**
| BH1750 | ESP32   |
|--------|---------|
| VCC    | 3.3V    |
| GND    | GND     |
| SDA    | GPIO 21 |
| SCL    | GPIO 22 |

**Relay → ESP32:**
| Relay | ESP32        |
|-------|--------------|
| VCC   | VIN (5V)     |
| GND   | GND          |
| IN    | GPIO 26      |

**Lampu AC → Relay:**
```
PLN Phase → COM Relay
NO Relay → Lampu
Lampu → PLN Netral
```

---

## 🚀 Cara Install Backend

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database MySQL

**Opsi A: Menggunakan MySQL Workbench (Recommended)**

1. Buka **MySQL Workbench**
2. Buka file `database_setup.sql`
3. Klik Execute (⚡) untuk menjalankan script
4. Database `iot_esp32` akan dibuat otomatis

📖 **Panduan lengkap:** Lihat file [`SETUP_DATABASE.md`](./SETUP_DATABASE.md)

**Opsi B: Menggunakan Command Line**

```bash
mysql -u root -p < database_setup.sql
```

### 3. Konfigurasi Environment

Edit file `.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=iot_esp32
DB_DIALECT=mysql
PORT=3009
NODE_ENV=development
```

⚠️ **Ganti `your_mysql_password_here` dengan password MySQL Anda!**

### 4. Jalankan Server

```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm start
```

Server akan berjalan di: **`http://localhost:3009`**

---

## 📡 API Endpoints

### 🔹 Sensor Data

#### 1. POST /api/iot/ping
**Endpoint untuk ESP32 mengirim data sensor**

**Request Body:**
```json
{
  "lux": 250.5,
  "relay_status": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Data sensor berhasil disimpan",
  "data": {
    "id": 1,
    "lux": 250.5,
    "relay_status": true,
    "mode": "AUTO",
    "threshold_low": 300,
    "threshold_high": 500,
    "createdAt": "2026-01-08T13:52:25.000Z"
  }
}
```

#### 2. GET /api/iot/data
**Get semua data dengan pagination**

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)

**Example:** `GET /api/iot/data?page=1&limit=10`

#### 3. GET /api/iot/latest
**Get data sensor terbaru**

#### 4. GET /api/iot/data/range
**Get data berdasarkan range waktu**

**Example:** `GET /api/iot/data/range?start=2026-01-01&end=2026-01-08`

#### 5. GET /api/iot/stats
**Get statistik data sensor**

Response:
```json
{
  "success": true,
  "stats": {
    "avgLux": 450.5,
    "maxLux": 1200.0,
    "minLux": 150.5,
    "totalRecords": 100
  },
  "relayDistribution": [
    { "relay_status": true, "count": 45 },
    { "relay_status": false, "count": 55 }
  ]
}
```

---

### 🔹 Control & Settings

#### 6. GET /api/iot/settings
**Get current settings (mode & threshold)**

Response:
```json
{
  "success": true,
  "data": {
    "mode": "AUTO",
    "threshold_low": 300,
    "threshold_high": 500,
    "relay_status": false,
    "lux": 550.2
  }
}
```

#### 7. PUT /api/iot/settings
**Update settings**

**Request Body:**
```json
{
  "mode": "MANUAL",
  "threshold_low": 250,
  "threshold_high": 600
}
```

#### 8. POST /api/iot/relay
**Manual relay control** (hanya untuk mode MANUAL)

**Request Body:**
```json
{
  "status": true
}
```

⚠️ **Catatan:** Endpoint ini hanya bisa digunakan saat `mode = MANUAL`

---

## 🎯 Logika Twilight Switch

| Lux       | Kondisi   | Relay | Lampu  |
|-----------|-----------|-------|--------|
| < 300     | Gelap     | ON    | Nyala  |
| 300 - 500 | Transisi  | -     | -      |
| > 500     | Terang    | OFF   | Mati   |

**Hysteresis** digunakan untuk mencegah relay klik-klik saat lux di ambang batas.

---

## 🔧 Setup ESP32

### 1. Install Library BH1750

Di **Arduino IDE**:
1. Tools → Manage Libraries
2. Cari: **"BH1750"** by Christopher Laws
3. Klik **Install**

### 2. Upload Code ke ESP32

1. Buka file: `esp32_bh1750_twilight.ino`
2. Edit WiFi credentials:
   ```cpp
   const char* ssid = "NAMA_WIFI_ANDA";
   const char* password = "PASSWORD_WIFI_ANDA";
   ```
3. Edit server IP (ganti dengan IP komputer Anda):
   ```cpp
   String serverName = "http://192.168.1.100:3009/api/iot/ping";
   ```
   
   💡 **Cara cek IP komputer:**
   - Windows: Buka CMD → ketik `ipconfig` → lihat IPv4 Address
   - Mac/Linux: Buka Terminal → ketik `ifconfig`

4. Board Settings:
   - Board: **ESP32 Dev Module**
   - Upload Speed: **115200**
   - Port: Pilih COM port ESP32

5. Klik **Upload** (→)

### 3. Monitor Serial

Buka **Serial Monitor** (Ctrl+Shift+M):
- Baud rate: **115200**
- Anda akan lihat:
  - Data lux real-time
  - Status relay (ON/OFF)
  - Response dari server

---

## 📊 Database Schema

**Table: `sensor_data`**

| Column         | Type                | Description                              |
|----------------|---------------------|------------------------------------------|
| id             | INT (PK)            | Auto increment                           |
| lux            | FLOAT               | Intensitas cahaya (lux)                  |
| relay_status   | BOOLEAN             | Status relay: 1=ON, 0=OFF                |
| mode           | ENUM('AUTO','MANUAL')| Mode kontrol                            |
| threshold_low  | INT                 | Threshold gelap (default: 300)           |
| threshold_high | INT                 | Threshold terang (default: 500)          |
| createdAt      | DATETIME            | Timestamp                                |
| updatedAt      | DATETIME            | Timestamp                                |

---

## 🧪 Testing dengan Postman

### Test 1: Kirim Data Sensor

```
POST http://localhost:3009/api/iot/ping
Content-Type: application/json

{
  "lux": 250,
  "relay_status": true
}
```

### Test 2: Get Latest Data

```
GET http://localhost:3009/api/iot/latest
```

### Test 3: Update Settings

```
PUT http://localhost:3009/api/iot/settings
Content-Type: application/json

{
  "mode": "MANUAL",
  "threshold_low": 200,
  "threshold_high": 600
}
```

### Test 4: Manual Relay Control

```
POST http://localhost:3009/api/iot/relay
Content-Type: application/json

{
  "status": true
}
```

---

## 📁 Struktur Folder

```
backend/
├── config/
│   └── database.js              # Database config
├── controllers/
│   └── iotController.js         # API logic
├── migrations/
│   └── 20260108000001-create-sensor-data.js
├── models/
│   ├── index.js                 # Sequelize loader
│   └── SensorData.js            # Model
├── routes/
│   └── iot.js                   # API routes
├── .env                         # Environment variables
├── .sequelizerc                 # Sequelize config
├── database_setup.sql           # SQL setup script
├── SETUP_DATABASE.md            # Database guide
├── package.json
├── README.md
└── server.js                    # Main server

esp32_bh1750_twilight.ino        # ESP32 Arduino code
```

---

## ❌ Troubleshooting

### Backend tidak bisa connect ke database

**Solusi:**
1. Pastikan MySQL service running
2. Cek kredensial di `.env`
3. Jalankan `database_setup.sql` di MySQL Workbench

### ESP32 tidak bisa connect ke WiFi

**Solusi:**
1. Pastikan WiFi **2.4GHz** (bukan 5GHz)
2. Cek SSID dan password
3. Pastikan ESP32 dalam jangkauan WiFi

### ESP32 HTTP Error

**Solusi:**
1. Pastikan backend running (`npm run dev`)
2. Cek IP address komputer benar
3. Cek firewall tidak block port 3009
4. Test di browser: `http://localhost:3009`

### BH1750 tidak terdeteksi

**Solusi:**
1. Cek koneksi I2C (SDA, SCL, VCC, GND)
2. Pastikan VCC = **3.3V** (bukan 5V)
3. Coba ganti kabel jumper
4. Install library BH1750

---

## 📖 Dokumentasi Tambahan

- **Setup Database:** [`SETUP_DATABASE.md`](./SETUP_DATABASE.md)
- **ESP32 Code:** [`esp32_bh1750_twilight.ino`](../esp32_bh1750_twilight.ino)

---

## 🔒 Security

- Helmet.js untuk security headers
- CORS enabled
- Environment variables untuk sensitive data

---

## 📄 License

ISC

---

**🎉 Happy Coding! Semoga lampu otomatis Anda berfungsi dengan baik!**

