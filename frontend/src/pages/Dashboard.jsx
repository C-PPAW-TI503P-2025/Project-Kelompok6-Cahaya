import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import iotService from '../services/iotService';
import './Dashboard.css';

const Dashboard = () => {
    const [sensorData, setSensorData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deviceStatus, setDeviceStatus] = useState('offline');
    const [relayStatus, setRelayStatus] = useState('MATI');
    const [mode, setMode] = useState('auto');
    const [chartData, setChartData] = useState([]);
    const [activityLog, setActivityLog] = useState([]);

    const fetchSensorData = async () => {
        try {
            const response = await iotService.getLatestSensorData();
            if (response.success && response.data) {
                setSensorData(response.data);
                setMode(response.data.mode || 'auto');
                setRelayStatus(response.data.relay_status ? 'HIDUP' : 'MATI');

                // Check connectivity
                const lastUpdate = new Date(response.data.createdAt);
                const now = new Date();
                const diffSeconds = (now - lastUpdate) / 1000;
                setDeviceStatus(diffSeconds < 15 ? 'online' : 'offline');
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setDeviceStatus('offline');
        } finally {
            setLoading(false);
        }
    };

    const fetchChartData = async () => {
        try {
            const response = await iotService.getSensorHistory({
                startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                endDate: new Date().toISOString().split('T')[0],
                limit: 50
            });

            if (response.success && response.data) {
                const formatted = response.data.slice(0, 20).reverse().map(item => ({
                    time: new Date(item.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                    value: item.lux
                }));
                setChartData(formatted);

                // Generate activity log from recent data
                const logs = response.data.slice(0, 5).map(item => ({
                    time: new Date(item.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                    action: item.mode === 'auto'
                        ? (item.relay_status ? 'Relay dimatikan otomatis' : 'Sistem dimulai')
                        : (item.relay_status ? 'Relay dinyalakan manual' : 'Mode diubah ke AUTO'),
                    status: item.relay_status ? 'success' : 'info'
                }));
                setActivityLog(logs);
            }
        } catch (err) {
            console.error('Error fetching chart data:', err);
        }
    };

    const handleModeChange = async (newMode) => {
        try {
            console.log(`🔄 Changing mode to: ${newMode}`);

            const response = await iotService.updateSettings({ mode: newMode });

            if (response.success) {
                setMode(newMode);
                console.log(`✅ Mode changed to: ${newMode}`);

                // Refresh data immediately
                await fetchSensorData();

                // Show success feedback
                alert(`✅ Mode berhasil diubah ke ${newMode.toUpperCase()}`);
            } else {
                throw new Error(response.message || 'Gagal mengubah mode');
            }
        } catch (err) {
            console.error('❌ Error changing mode:', err);
            alert(`❌ Gagal mengubah mode: ${err.message}`);

            // Revert mode on error
            await fetchSensorData();
        }
    };

    const toggleRelay = async () => {
        if (mode !== 'manual') {
            alert('⚠️ Ubah ke mode MANUAL terlebih dahulu untuk kontrol relay');
            return;
        }

        try {
            const newStatus = relayStatus === 'MATI';
            console.log(`🔌 Toggling relay to: ${newStatus ? 'ON' : 'OFF'}`);

            const response = await iotService.controlRelay(newStatus);

            if (response.success) {
                setRelayStatus(newStatus ? 'HIDUP' : 'MATI');
                console.log(`✅ Relay ${newStatus ? 'ON' : 'OFF'}`);

                // Refresh data
                await fetchSensorData();
            } else {
                throw new Error(response.message || 'Gagal mengontrol relay');
            }
        } catch (err) {
            console.error('❌ Error controlling relay:', err);
            alert(`❌ Gagal mengontrol relay: ${err.message}`);
        }
    };

    useEffect(() => {
        fetchSensorData();
        fetchChartData();
        const interval = setInterval(() => {
            fetchSensorData();
            fetchChartData();
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
                <p>Memuat data...</p>
            </div>
        );
    }

    const lastUpdate = sensorData ? new Date(sensorData.createdAt).toLocaleString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }) : '-';

    const activeHours = 6.5; // Mock data
    const efficiency = 87; // Mock data

    return (
        <div className="dashboard-container">
            {/* Status Bar */}
            <div className="status-bar">
                <div className="status-left">
                    <span className="status-text">Status Perangkat:</span>
                    <span className={`status-badge ${deviceStatus}`}>
                        <span className="status-dot"></span>
                        {deviceStatus === 'online' ? 'Online' : 'Offline'}
                    </span>
                </div>
                <div className="status-right">
                    <span className="last-update-text">
                        ⏰ Last Update: {lastUpdate}
                    </span>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="stats-cards">
                <div className="stat-card">
                    <div className="stat-content">
                        <div className="stat-info">
                            <p className="stat-label">Intensitas Cahaya</p>
                            <p className="stat-value">{sensorData?.lux?.toFixed(2) || '0.00'}</p>
                            <p className="stat-unit">Lux</p>
                        </div>
                        <div className="stat-icon sun">☀️</div>
                    </div>
                    <div className="stat-badge normal">Normal</div>
                </div>

                <div className="stat-card">
                    <div className="stat-content">
                        <div className="stat-info">
                            <p className="stat-label">Status Relay</p>
                            <p className="stat-value">{relayStatus}</p>
                            <p className="stat-unit">Mode {mode.toUpperCase()}</p>
                        </div>
                        <div className="stat-icon zap">⚡</div>
                    </div>
                    <div className={`stat-badge ${relayStatus === 'HIDUP' ? 'active' : 'inactive'}`}>
                        {relayStatus === 'HIDUP' ? 'Aktif' : 'Non-aktif'}
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-content">
                        <div className="stat-info">
                            <p className="stat-label">Waktu Aktif Hari Ini</p>
                            <p className="stat-value">{activeHours}</p>
                            <p className="stat-unit">Jam</p>
                        </div>
                        <div className="stat-icon activity">📊</div>
                    </div>
                    <div className="stat-trend">📈 +12% dari kemarin</div>
                </div>

                <div className="stat-card">
                    <div className="stat-content">
                        <div className="stat-info">
                            <p className="stat-label">Efisiensi Energi</p>
                            <p className="stat-value">{efficiency}%</p>
                            <p className="stat-unit">Optimal</p>
                        </div>
                        <div className="stat-icon trending">📈</div>
                    </div>
                    <div className="stat-trend">📈 +5% lebih efisien</div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="main-grid">
                {/* Chart Section */}
                <div className="chart-card">
                    <div className="card-header">
                        <h3>Grafik Intensitas Cahaya</h3>
                        <p className="card-subtitle">Monitoring 24 jam terakhir</p>
                    </div>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="time" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                                <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#6366f1"
                                    strokeWidth={2}
                                    fill="url(#colorValue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Control Panel */}
                <div className="control-card">
                    <h3 className="card-title">Kontrol Relay</h3>

                    <div className="control-content">
                        {/* Status Display */}
                        <div className="relay-status-display">
                            <span className="status-label-small">Status</span>
                            <span className={`relay-badge ${relayStatus === 'HIDUP' ? 'on' : 'off'}`}>
                                {relayStatus}
                            </span>
                        </div>

                        {/* Mode Tabs */}
                        <div className="mode-section">
                            <label className="mode-label">Mode Operasi:</label>
                            <div className="mode-tabs">
                                <button
                                    className={`mode-tab ${mode === 'auto' ? 'active' : ''}`}
                                    onClick={() => handleModeChange('auto')}
                                >
                                    AUTO
                                </button>
                                <button
                                    className={`mode-tab ${mode === 'manual' ? 'active' : ''}`}
                                    onClick={() => handleModeChange('manual')}
                                >
                                    MANUAL
                                </button>
                            </div>
                        </div>

                        {/* Toggle Button */}
                        <button
                            onClick={toggleRelay}
                            className={`relay-btn ${relayStatus === 'HIDUP' ? 'btn-off' : 'btn-on'}`}
                            disabled={mode !== 'manual'}
                        >
                            {relayStatus === 'HIDUP' ? 'Matikan Relay' : 'Nyalakan Relay'}
                        </button>

                        {/* Info Box */}
                        <div className="info-box">
                            <p className="info-text">
                                {mode === 'auto'
                                    ? '⚙️ Mode AUTO aktif. Relay dikontrol otomatis berdasarkan sensor cahaya.'
                                    : '👆 Mode MANUAL aktif. Anda dapat mengontrol relay secara manual.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity Log */}
            <div className="activity-card">
                <h3 className="card-title">Log Aktivitas Terbaru</h3>
                <div className="activity-list">
                    {activityLog.map((log, index) => (
                        <div key={index} className="activity-item">
                            <div className={`activity-dot ${log.status}`}></div>
                            <span className="activity-time">{log.time}</span>
                            <span className="activity-action">{log.action}</span>
                            <span className={`activity-badge ${log.status}`}>
                                {log.status === 'success' ? 'Success' : log.status === 'warning' ? 'Warning' : 'Info'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
