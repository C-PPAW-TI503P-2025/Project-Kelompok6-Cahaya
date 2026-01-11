# Setup Database Baru - IoT Twilight Switch

## 📋 Langkah-Langkah Setup:

### 1. **Jalankan SQL Script di MySQL Workbench**

1. Buka **MySQL Workbench**
2. Connect ke MySQL server Anda
3. Buka file `database_setup_v2.sql`
4. Klik **Execute** (⚡ icon) atau tekan `Ctrl+Shift+Enter`
5. Tunggu sampai selesai - database `iot_twilight_switch` akan dibuat

### 2. **Update File .env**

Buka file `.env` di folder `backend` dan ubah baris ini:

```env
DB_NAME=iot_twilight_switch
```

Ganti dari `iot_esp32` ke `iot_twilight_switch`

**Contoh lengkap file .env:**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=iot_twilight_switch
DB_DIALECT=mysql
PORT=3009
NODE_ENV=development
```

### 3. **Restart Backend**

```bash
cd backend
npm run dev
```

### 4. **Verifikasi**

Jika berhasil, Anda akan lihat:
```
✅ Database connected successfully
✅ Database models synced
🚀 Server running on http://localhost:3009
```

### 5. **Test dengan ESP32**

Upload kode Arduino ke ESP32 dan buka Serial Monitor. Anda akan lihat:
```
☀️  Light: 45.5 lux [GELAP]
💡 Relay: ON | Mode: auto | Threshold: 100 lux
📤 Sending to server... ✅ OK (200)
```

## ✅ Perubahan Database Baru:

- ✅ Nama database: `iot_twilight_switch` (lebih deskriptif)
- ✅ Kolom `manual_relay_state` sudah ada
- ✅ Mode enum: `'auto', 'manual'` (lowercase)
- ✅ Default threshold: `100 lux` (lebih cocok untuk twilight switch)
- ✅ Sample data dengan logika yang benar (gelap=ON, terang=OFF)

## 🎯 Logika Twilight Switch:

**Mode AUTO:**
- Lux < 100 → Relay **ON** (lampu nyala) 🌙
- Lux ≥ 100 → Relay **OFF** (lampu mati) ☀️

**Mode MANUAL:**
- Relay mengikuti perintah dari backend
- Tidak terpengaruh nilai lux

---

**Selamat mencoba! 🚀**
