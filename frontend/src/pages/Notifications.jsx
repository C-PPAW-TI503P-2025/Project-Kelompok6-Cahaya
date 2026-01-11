import { useState, useEffect } from 'react';
import notificationService from '../services/notificationService';
import './Notifications.css';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unread, read

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await notificationService.getAllNotifications();
            if (response.success) {
                setNotifications(response.data);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            fetchNotifications();
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            fetchNotifications();
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Yakin ingin menghapus notifikasi ini?')) {
            try {
                await notificationService.deleteNotification(id);
                fetchNotifications();
            } catch (error) {
                console.error('Error deleting notification:', error);
            }
        }
    };

    const filteredNotifications = notifications.filter(notif => {
        if (filter === 'unread') return !notif.is_read;
        if (filter === 'read') return notif.is_read;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.is_read).length;

    if (loading) {
        return (
            <div className="notifications-loading">
                <div className="spinner"></div>
                <p>Memuat notifikasi...</p>
            </div>
        );
    }

    return (
        <div className="notifications-page">
            <div className="page-header">
                <h1>🔔 Notifikasi {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}</h1>
                {unreadCount > 0 && (
                    <button className="btn-mark-all" onClick={handleMarkAllAsRead}>
                        ✓ Tandai Semua Sudah Dibaca
                    </button>
                )}
            </div>

            <div className="filter-tabs">
                <button
                    className={`tab ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    Semua ({notifications.length})
                </button>
                <button
                    className={`tab ${filter === 'unread' ? 'active' : ''}`}
                    onClick={() => setFilter('unread')}
                >
                    Belum Dibaca ({unreadCount})
                </button>
                <button
                    className={`tab ${filter === 'read' ? 'active' : ''}`}
                    onClick={() => setFilter('read')}
                >
                    Sudah Dibaca ({notifications.length - unreadCount})
                </button>
            </div>

            <div className="notifications-list">
                {filteredNotifications.length === 0 ? (
                    <div className="no-notifications">
                        <p>📭 Tidak ada notifikasi</p>
                    </div>
                ) : (
                    filteredNotifications.map(notif => (
                        <div
                            key={notif.id}
                            className={`notification-item ${!notif.is_read ? 'unread' : ''} ${notif.type}`}
                        >
                            <div className="notif-icon">
                                {notif.type === 'info' && 'ℹ️'}
                                {notif.type === 'warning' && '⚠️'}
                                {notif.type === 'error' && '❌'}
                            </div>
                            <div className="notif-content">
                                <h3>{notif.title}</h3>
                                <p>{notif.message}</p>
                                <small>{new Date(notif.createdAt).toLocaleString('id-ID')}</small>
                            </div>
                            <div className="notif-actions">
                                {!notif.is_read && (
                                    <button
                                        className="btn-read"
                                        onClick={() => handleMarkAsRead(notif.id)}
                                        title="Tandai sudah dibaca"
                                    >
                                        ✓
                                    </button>
                                )}
                                <button
                                    className="btn-delete-notif"
                                    onClick={() => handleDelete(notif.id)}
                                    title="Hapus"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notifications;
