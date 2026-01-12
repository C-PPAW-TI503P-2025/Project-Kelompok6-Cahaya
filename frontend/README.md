# Twilight Switch - Frontend

Frontend aplikasi web untuk sistem monitoring dan kontrol lampu otomatis berbasis IoT menggunakan ESP32 dan sensor BH1750.

## 🚀 Fitur

### User Features
- ✅ **Dashboard Real-time**: Monitoring sensor cahaya, suhu, dan kelembaban
- ✅ **Kontrol Relay**: ON/OFF manual dan mode AUTO/MANUAL
- ✅ **Grafik Histori**: Visualisasi data sensor dan relay logs dengan Recharts
- ✅ **Pengaturan**: Konfigurasi threshold dan mode operasi

### Admin Features (Coming Soon)
- Kelola user
- Kelola perangkat IoT
- View notifikasi sistem

## 🛠️ Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Styling**: Vanilla CSS dengan design system modern

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Configuration

### Environment Variables

Buat file `.env` di root folder frontend:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### Backend Integration

Frontend berkomunikasi dengan backend Node.js melalui REST API. Pastikan backend sudah running di `http://localhost:3000`.

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── Layout/         # Navbar, Sidebar, MainLayout
│   │   ├── Charts/         # Chart components (future)
│   │   ├── ProtectedRoute.jsx
│   │   ├── SensorCard.jsx
│   │   └── RelayControl.jsx
│   ├── pages/              # Page components
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── History.jsx
│   │   ├── Settings.jsx
│   │   └── NotFound.jsx
│   ├── services/           # API services
│   │   ├── api.js
│   │   ├── authService.js
│   │   └── iotService.js
│   ├── context/            # React Context
│   │   └── AuthContext.jsx
│   ├── utils/              # Utility functions
│   │   └── formatters.js
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 🎨 Design System

Frontend menggunakan design system modern dengan:
- **Color Palette**: Gradient purple-blue (#667eea → #764ba2)
- **Typography**: Inter font family
- **Components**: Card-based layout dengan shadow dan hover effects
- **Responsive**: Mobile-first design

## 🔐 Authentication

- Login dengan email dan password
- Token disimpan di localStorage
- Auto-logout pada 401 response
- Protected routes dengan role-based access

## 📊 API Integration

### Auth Service
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register (optional)

### IoT Service
- `GET /api/iot/sensor-data/latest` - Get latest sensor data
- `GET /api/iot/sensor-data/history` - Get sensor history
- `POST /api/iot/relay/control` - Control relay
- `GET /api/iot/relay/logs` - Get relay logs
- `GET /api/iot/device-settings/:id` - Get device settings
- `PUT /api/iot/device-settings/:id` - Update device settings

## 🚦 Usage

### Login
1. Buka `http://localhost:5173`
2. Login dengan kredensial:
   - Email: `admin@twilight.com`
   - Password: `password`

### Dashboard
- View real-time sensor data (auto-refresh setiap 5 detik)
- Monitor relay status
- Control relay (ON/OFF) dalam mode MANUAL
- Switch mode AUTO/MANUAL

### History
- Pilih date range
- View grafik sensor data (Lux, Suhu, Kelembaban)
- View grafik relay logs (ON/OFF events)

### Settings
- Set threshold cahaya (Lux)
- Ubah mode operasi (AUTO/MANUAL)

## 🐛 Troubleshooting

### Backend Connection Error
- Pastikan backend running di `http://localhost:3000`
- Check CORS configuration di backend
- Verify `.env` file

### Auto-refresh Not Working
- Check browser console untuk errors
- Verify API endpoint `/api/iot/sensor-data/latest`

## 📝 License

MIT

## 👥 Team

Project Kelompok 6 - Cahaya
- PAW TI503P 2025
- Universitas Muhammadiyah Yogyakarta
