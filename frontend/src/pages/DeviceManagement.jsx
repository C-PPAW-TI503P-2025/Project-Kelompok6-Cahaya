import { useState, useEffect } from 'react';
import deviceService from '../services/deviceService';
import './DeviceManagement.css';

const DeviceManagement = () => {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        device_id: '',
        location: '',
        status: 'active'
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchDevices();
    }, []);

    const fetchDevices = async () => {
        try {
            const response = await deviceService.getAllDevices();
            if (response.success) {
                setDevices(response.data);
            }
        } catch (error) {
            console.error('Error fetching devices:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (mode, device = null) => {
        setModalMode(mode);
        setSelectedDevice(device);
        if (mode === 'edit' && device) {
            setFormData({
                name: device.name,
                device_id: device.device_id,
                location: device.location || '',
                status: device.status
            });
        } else {
            setFormData({
                name: '',
                device_id: '',
                location: '',
                status: 'active'
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedDevice(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === 'add') {
                await deviceService.createDevice(formData);
                setMessage('Device berhasil ditambahkan');
            } else {
                await deviceService.updateDevice(selectedDevice.id, formData);
                setMessage('Device berhasil diupdate');
            }
            fetchDevices();
            handleCloseModal();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Terjadi kesalahan');
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Yakin ingin menghapus device ini?')) {
            try {
                await deviceService.deleteDevice(id);
                setMessage('Device berhasil dihapus');
                fetchDevices();
                setTimeout(() => setMessage(''), 3000);
            } catch (error) {
                setMessage(error.response?.data?.message || 'Gagal menghapus device');
                setTimeout(() => setMessage(''), 3000);
            }
        }
    };

    if (loading) {
        return (
            <div className="device-management-loading">
                <div className="spinner"></div>
                <p>Memuat data...</p>
            </div>
        );
    }

    return (
        <div className="device-management">
            <div className="page-header">
                <h1>📱 Kelola Perangkat</h1>
                <button className="btn-add" onClick={() => handleOpenModal('add')}>
                    + Tambah Device
                </button>
            </div>

            {message && (
                <div className={`message ${message.includes('Gagal') ? 'error' : 'success'}`}>
                    {message}
                </div>
            )}

            <div className="table-container">
                <table className="devices-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nama</th>
                            <th>Device ID</th>
                            <th>Lokasi</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {devices.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="no-data">Tidak ada data</td>
                            </tr>
                        ) : (
                            devices.map(device => (
                                <tr key={device.id}>
                                    <td>{device.id}</td>
                                    <td>{device.name}</td>
                                    <td><code>{device.device_id}</code></td>
                                    <td>{device.location || '-'}</td>
                                    <td>
                                        <span className={`status-badge ${device.status}`}>
                                            {device.status === 'active' ? '✅ Active' : '❌ Inactive'}
                                        </span>
                                    </td>
                                    <td className="actions">
                                        <button className="btn-edit" onClick={() => handleOpenModal('edit', device)}>
                                            ✏️ Edit
                                        </button>
                                        <button className="btn-delete" onClick={() => handleDelete(device.id)}>
                                            🗑️ Hapus
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{modalMode === 'add' ? 'Tambah Device Baru' : 'Edit Device'}</h2>
                            <button className="btn-close" onClick={handleCloseModal}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nama Device</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Device ID</label>
                                <input
                                    type="text"
                                    value={formData.device_id}
                                    onChange={(e) => setFormData({ ...formData, device_id: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Lokasi</label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                                    Batal
                                </button>
                                <button type="submit" className="btn-submit">
                                    {modalMode === 'add' ? 'Tambah' : 'Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeviceManagement;
