import { useState, useEffect } from 'react';
import iotService from '../services/iotService';
import './RelayControl.css';

const RelayControl = ({ onUpdate }) => {
    const [relayStatus, setRelayStatus] = useState(false);
    const [mode, setMode] = useState('auto');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchDeviceSettings();
        // Poll every 5 seconds
        const interval = setInterval(fetchDeviceSettings, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchDeviceSettings = async () => {
        try {
            const response = await iotService.getLatestSensorData();
            if (response.success && response.data) {
                setMode(response.data.mode || 'auto');
                setRelayStatus(response.data.relay_status || false);
            }
        } catch (err) {
            console.error('Error fetching settings:', err);
        }
    };

    const handleToggleRelay = async () => {
        if (mode === 'AUTO') {
            setMessage('Tidak bisa kontrol manual saat mode AUTO');
            setTimeout(() => setMessage(''), 3000);
            return;
        }

        setLoading(true);
        const newStatus = !relayStatus;

        try {
            await iotService.controlRelay(newStatus);
            setRelayStatus(newStatus);
            setMessage(`Relay berhasil di${newStatus ? 'nyalakan' : 'matikan'}`);
            if (onUpdate) onUpdate();
        } catch (err) {
            setMessage('Gagal mengontrol relay');
            console.error(err);
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleModeChange = async (newMode) => {
        setLoading(true);
        try {
            await iotService.updateDeviceSettings({ mode: newMode });
            setMode(newMode);
            setMessage(`Mode berhasil diubah ke ${newMode.toUpperCase()}`);
            if (onUpdate) onUpdate();
        } catch (err) {
            setMessage('Gagal mengubah mode');
            console.error(err);
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    return (
        <div className="relay-control">
            <div className="relay-header">
                <h3>🔌 Kontrol Relay</h3>
            </div>

            <div className="relay-status">
                <div className={`status-indicator ${relayStatus ? 'on' : 'off'}`}>
                    <div className="status-light"></div>
                    <span>{relayStatus ? 'NYALA ⚡' : 'MATI 💤'}</span>
                </div>
            </div>

            <div className="mode-selector">
                <label>Mode:</label>
                <div className="mode-buttons">
                    <button
                        className={`mode-btn ${mode === 'auto' ? 'active' : ''}`}
                        onClick={() => handleModeChange('auto')}
                        disabled={loading}
                    >
                        AUTO
                    </button>
                    <button
                        className={`mode-btn ${mode === 'manual' ? 'active' : ''}`}
                        onClick={() => handleModeChange('manual')}
                        disabled={loading}
                    >
                        MANUAL
                    </button>
                </div>
            </div>

            <button
                className={`relay-toggle ${relayStatus ? 'on' : 'off'}`}
                onClick={handleToggleRelay}
                disabled={loading || mode === 'auto'}
            >
                {loading ? 'Loading...' : relayStatus ? 'Matikan' : 'Nyalakan'}
            </button>

            {message && (
                <div className={`relay-message ${message.includes('Gagal') ? 'error' : 'success'}`}>
                    {message}
                </div>
            )}

            {mode === 'auto' && (
                <p className="relay-info">
                    ℹ️ Mode AUTO aktif. Relay dikontrol otomatis berdasarkan sensor cahaya.
                </p>
            )}
        </div>
    );
};

export default RelayControl;
