import { useState, useEffect } from 'react';
import iotService from '../services/iotService';
import './History.css';

const History = () => {
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
    });
    const [stats, setStats] = useState({
        totalRecords: 0,
        avgIntensity: 0,
        autoActivations: 0,
        manualActivations: 0
    });
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;

    useEffect(() => {
        fetchData();
    }, [dateRange]);

    const fetchData = async () => {
        try {
            const response = await iotService.getSensorHistory({
                startDate: dateRange.start,
                endDate: dateRange.end,
                limit: 100,
            });

            if (response.success && response.data) {
                setHistoryData(response.data);
                calculateStats(response.data);
            }
        } catch (err) {
            console.error('Error fetching history:', err);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        const totalRecords = data.length;
        const avgIntensity = data.reduce((sum, item) => sum + item.lux, 0) / totalRecords || 0;
        const autoActivations = data.filter(item => item.mode === 'auto' && item.relay_status).length;
        const manualActivations = data.filter(item => item.mode === 'manual' && item.relay_status).length;

        setStats({
            totalRecords,
            avgIntensity: avgIntensity.toFixed(1),
            autoActivations,
            manualActivations
        });
    };

    const exportToCSV = () => {
        const headers = ['Timestamp', 'Intensitas Cahaya', 'Status Relay', 'Mode', 'Aksi'];
        const csvData = historyData.map(item => [
            new Date(item.createdAt).toLocaleString('id-ID'),
            `${item.lux} Lux`,
            item.relay_status ? 'ON' : 'OFF',
            item.mode.toUpperCase(),
            item.mode === 'auto' ? 'Relay dimatikan otomatis' : 'Relay dinyalakan manual'
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `history_data_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    // Pagination
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = historyData.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(historyData.length / recordsPerPage);

    if (loading) {
        return (
            <div className="history-loading">
                <div className="spinner"></div>
                <p>Memuat data...</p>
            </div>
        );
    }

    return (
        <div className="history-container">
            {/* Page Header */}
            <div className="page-header">
                <h2 className="page-title">Histori Data</h2>
                <p className="page-subtitle">Riwayat monitoring dan aktivitas sistem</p>
            </div>

            {/* Filter and Export */}
            <div className="filter-card">
                <div className="filter-actions">
                    <div className="filter-left">
                        <button className="btn-filter">
                            📅 Pilih Tanggal
                        </button>
                        <button className="btn-filter">
                            🔍 Filter
                        </button>
                    </div>
                    <button className="btn-export" onClick={exportToCSV}>
                        📥 Export CSV
                    </button>
                </div>
            </div>

            {/* Statistics Summary */}
            <div className="stats-summary">
                <div className="summary-card">
                    <p className="summary-label">Total Records</p>
                    <p className="summary-value">{stats.totalRecords.toLocaleString()}</p>
                </div>
                <div className="summary-card">
                    <p className="summary-label">Avg Intensity</p>
                    <p className="summary-value">{stats.avgIntensity} Lux</p>
                </div>
                <div className="summary-card">
                    <p className="summary-label">Auto Activations</p>
                    <p className="summary-value">{stats.autoActivations}</p>
                </div>
                <div className="summary-card">
                    <p className="summary-label">Manual Activations</p>
                    <p className="summary-value">{stats.manualActivations}</p>
                </div>
            </div>

            {/* History Table */}
            <div className="table-card">
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>Intensitas Cahaya</th>
                                <th>Status Relay</th>
                                <th>Mode</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentRecords.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="no-data">Tidak ada data untuk periode ini</td>
                                </tr>
                            ) : (
                                currentRecords.map((item, index) => (
                                    <tr key={item.id || index}>
                                        <td className="font-medium">
                                            {new Date(item.createdAt).toLocaleString('id-ID')}
                                        </td>
                                        <td>
                                            <span className="lux-value">{item.lux.toFixed(1)} Lux</span>
                                        </td>
                                        <td>
                                            <span className={`table-badge ${item.relay_status ? 'badge-on' : 'badge-off'}`}>
                                                {item.relay_status ? 'ON' : 'OFF'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="table-badge badge-outline">
                                                {item.mode.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="action-cell">
                                            {item.mode === 'auto'
                                                ? (item.relay_status ? 'Relay dimatikan otomatis' : 'Sistem dimulai')
                                                : (item.relay_status ? 'Relay dinyalakan manual' : 'Mode diubah ke AUTO')}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="pagination">
                    <p className="pagination-info">
                        Menampilkan {indexOfFirstRecord + 1}-{Math.min(indexOfLastRecord, historyData.length)} dari {historyData.length} records
                    </p>
                    <div className="pagination-buttons">
                        <button
                            className="page-btn"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        {[...Array(Math.min(totalPages, 3))].map((_, i) => (
                            <button
                                key={i}
                                className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                                onClick={() => setCurrentPage(i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            className="page-btn"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default History;
