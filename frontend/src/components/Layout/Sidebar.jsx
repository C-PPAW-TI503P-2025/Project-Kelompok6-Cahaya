import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
    const { role } = useAuth();

    return (
        <aside className="sidebar">
            <nav className="sidebar-nav">
                <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <span className="nav-icon">📊</span>
                    <span>Dashboard</span>
                </NavLink>

                <NavLink to="/history" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <span className="nav-icon">📈</span>
                    <span>Histori Data</span>
                </NavLink>

                <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <span className="nav-icon">⚙️</span>
                    <span>Pengaturan</span>
                </NavLink>

                {role === 'admin' && (
                    <>
                        <div className="nav-divider"></div>
                        <div className="nav-section-title">Admin</div>

                        <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                            <span className="nav-icon">👥</span>
                            <span>Kelola User</span>
                        </NavLink>
                    </>
                )}
            </nav>
        </aside>
    );
};

export default Sidebar;
