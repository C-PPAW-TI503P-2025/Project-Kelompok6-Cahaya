import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <h2>🌅 Twilight Switch</h2>
            </div>

            <div className="navbar-menu">
                <div className="navbar-user">
                    <span className="user-name">{user?.name || user?.email}</span>
                    <span className="user-role">{user?.role === 'admin' ? 'Admin' : 'User'}</span>
                </div>
                <button onClick={handleLogout} className="btn-logout">
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
