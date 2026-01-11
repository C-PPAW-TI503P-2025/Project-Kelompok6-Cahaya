import { useState, useEffect } from 'react';
import iotService from '../services/iotService';
import './Settings.css';

const Settings = () => {
    const [settings, setSettings] = useState({
        // Device Settings
        deviceName: 'Twilight Switch v1.0',
        location: 'Ruang Utama',
        autoStart: true,
        delayProtection: true,

        // Sensor Configuration (from backend)
        thresholdOn: 200,
        thresholdOff: 300,
        delayTime: 5,
        mode: 'auto',

        // Data Management (mock)
        autoBackup: true
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await iotService.getSettings();
            if (response.success && response.data) {
                setSettings(prev => ({
                    ...prev,
                    mode: response.data.mode || 'auto',
                    thresholdOn: response.data.lux_threshold || 200,
                    thresholdOff: (response.data.lux_threshold || 200) + 100,
                    delayTime: 5 // Default, not in backend yet
                }));
            }
        } catch (err) {
            console.error('Error fetching settings:', err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // Update mode and threshold to backend
            await iotService.updateSettings({
                mode: settings.mode,
                threshold: parseInt(settings.thresholdOn)
            });

            setMessage({ type: 'success', text: '✅ Pengaturan berhasil disimpan!' });

            // Refresh settings from backend
            await fetchSettings();

            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: '❌ Gagal menyimpan pengaturan: ' + err.message });
            console.error('Error saving settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleExportData = async () => {
        try {
            setMessage({ type: 'info', text: '📥 Mengekspor data...' });

            const response = await iotService.getSensorHistory({
                startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                endDate: new Date().toISOString().split('T')[0],
                limit: 1000
            });

            if (response.success && response.data) {
                const csvContent = [
                    ['Timestamp', 'Lux', 'Relay Status', 'Mode'].join(','),
                    ...response.data.map(item => [
                        new Date(item.createdAt).toLocaleString('id-ID'),
                        item.lux,
                        item.relay_status ? 'ON' : 'OFF',
                        item.mode.toUpperCase()
                    ].join(','))
                ].join('\n');

                const blob = new Blob([csvContent], { type: 'text/csv' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `twilight_data_${new Date().toISOString().split('T')[0]}.csv`;
                link.click();

                setMessage({ type: 'success', text: '✅ Data berhasil diekspor!' });
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            }
        } catch (err) {
            setMessage({ type: 'error', text: '❌ Gagal mengekspor data' });
            console.error('Error exporting data:', err);
        }
    };

    const handleClearHistory = async () => {
        if (window.confirm('⚠️ Apakah Anda yakin ingin menghapus semua riwayat data?\n\nTindakan ini tidak dapat dibatalkan!')) {
            try {
                setMessage({ type: 'info', text: '🗑️ Menghapus riwayat...' });

                const response = await iotService.clearHistory();

                if (response.success) {
                    setMessage({ type: 'success', text: '✅ Riwayat data berhasil dihapus!' });
                    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
                }
            } catch (err) {
                setMessage({ type: 'error', text: '❌ Gagal menghapus riwayat' });
                console.error('Error clearing history:', err);
            }
        }
    };

    const handleResetDefault = () => {
        if (window.confirm('🔄 Reset semua pengaturan ke default?')) {
            setSettings(prev => ({
                ...prev,
                thresholdOn: 200,
                thresholdOff: 300,
                delayTime: 5,
                mode: 'auto',
                autoStart: true,
                delayProtection: true
            }));
            setMessage({ type: 'success', text: '✅ Pengaturan direset ke default!' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    return (
        <div className="settings-container">
            {/* Page Header */}
            <div className="page-header">
                <h2 className="page-title">Pengaturan Sistem</h2>
                <p className="page-subtitle">Konfigurasi dan preferensi sistem monitoring</p>
            </div>

            {/* Message Alert */}
            {message.text && (
                <div className={`alert alert-${message.type}`}>
                    {message.text}
                </div>
            )}

            {/* Device Settings */}
            <div className="settings-card">
                <div className="card-header-icon">
                    <div className="icon-wrapper indigo">⚙️</div>
                    <div>
                        <h3 className="card-title">Pengaturan Perangkat</h3>
                        <p className="card-subtitle">Konfigurasi perangkat dan sensor</p>
                    </div>
                </div>

                <div className="card-content">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="deviceName">Nama Perangkat</label>
                            <input
                                type="text"
                                id="deviceName"
                                name="deviceName"
                                value={settings.deviceName}
                                onChange={handleInputChange}
                                className="form-input"
                            />
                            <p className="form-hint">Nama identifikasi perangkat IoT</p>
                        </div>
                        <div className="form-group">
                            <label htmlFor="location">Lokasi</label>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                value={settings.location}
                                onChange={handleInputChange}
                                className="form-input"
                            />
                            <p className="form-hint">Lokasi penempatan perangkat</p>
                        </div>
                    </div>

                    <div className="divider"></div>

                    <div className="toggle-list">
                        <div className="toggle-item">
                            <div className="toggle-info">
                                <label>Mode Auto Start</label>
                                <p className="toggle-desc">Aktifkan mode AUTO saat sistem dimulai</p>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    name="autoStart"
                                    checked={settings.autoStart}
                                    onChange={handleInputChange}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="toggle-item">
                            <div className="toggle-info">
                                <label>Delay Protection</label>
                                <p className="toggle-desc">Tunda switching untuk mencegah fluktuasi cepat</p>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    name="delayProtection"
                                    checked={settings.delayProtection}
                                    onChange={handleInputChange}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sensor Configuration - CONNECTED TO BACKEND */}
            <div className="settings-card">
                <div className="card-header-icon">
                    <div className="icon-wrapper amber">☀️</div>
                    <div>
                        <h3 className="card-title">Konfigurasi Sensor</h3>
                        <p className="card-subtitle">Threshold dan kalibrasi sensor cahaya (tersimpan di backend)</p>
                    </div>
                </div>

                <div className="card-content">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="thresholdOn">Threshold ON (Lux)</label>
                            <input
                                type="number"
                                id="thresholdOn"
                                name="thresholdOn"
                                value={settings.thresholdOn}
                                onChange={handleInputChange}
                                className="form-input"
                                min="0"
                                max="1000"
                            />
                            <p className="form-hint">⚡ Relay akan menyala jika cahaya di bawah nilai ini</p>
                        </div>
                        <div className="form-group">
                            <label htmlFor="mode">Mode Operasi</label>
                            <select
                                id="mode"
                                name="mode"
                                value={settings.mode}
                                onChange={handleInputChange}
                                className="form-input"
                            >
                                <option value="auto">AUTO - Otomatis berdasarkan sensor</option>
                                <option value="manual">MANUAL - Kontrol manual</option>
                            </select>
                            <p className="form-hint">🔧 Mode saat ini: {settings.mode.toUpperCase()}</p>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="delayTime">Delay Time (detik)</label>
                        <input
                            type="number"
                            id="delayTime"
                            name="delayTime"
                            value={settings.delayTime}
                            onChange={handleInputChange}
                            className="form-input"
                            min="0"
                            max="60"
                        />
                        <p className="form-hint">⏱️ Waktu tunda sebelum relay berubah status</p>
                    </div>
                </div>
            </div>

            {/* Data Management - CONNECTED TO BACKEND */}
            <div className="settings-card">
                <div className="card-header-icon">
                    <div className="icon-wrapper green">💾</div>
                    <div>
                        <h3 className="card-title">Manajemen Data</h3>
                        <p className="card-subtitle">Backup dan pengelolaan data (terhubung ke backend)</p>
                    </div>
                </div>

                <div className="card-content">
                    <div className="toggle-item">
                        <div className="toggle-info">
                            <label>Auto Backup</label>
                            <p className="toggle-desc">Backup data otomatis setiap minggu</p>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                name="autoBackup"
                                checked={settings.autoBackup}
                                onChange={handleInputChange}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    <div className="divider"></div>

                    <div className="button-group">
                        <button className="btn-outline" onClick={handleExportData}>
                            📥 Export Data
                        </button>
                        <button className="btn-outline" onClick={handleClearHistory} style={{ color: '#dc2626', borderColor: '#dc2626' }}>
                            🗑️ Clear History
                        </button>
                    </div>

                    <div className="alert alert-info" style={{ marginTop: '16px', backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
                        ⚠️ Clear History akan menghapus semua data kecuali record terakhir
                    </div>
                </div>
            </div>

            {/* Save Buttons */}
            <div className="action-buttons">
                <button className="btn-outline" onClick={handleResetDefault}>
                    🔄 Reset to Default
                </button>
                <button className="btn-primary" onClick={handleSave} disabled={loading}>
                    {loading ? '💾 Menyimpan...' : '💾 Simpan Perubahan'}
                </button>
            </div>

            <div className="alert alert-info" style={{ backgroundColor: '#e0e7ff', color: '#3730a3', border: '1px solid #c7d2fe' }}>
                💡 <strong>Catatan:</strong> Hanya pengaturan Sensor (Threshold & Mode) yang tersimpan ke backend.
                Pengaturan lainnya (WiFi, Notifikasi, Security) akan diimplementasikan di versi mendatang.
            </div>
        </div>
    );
};

export default Settings;
