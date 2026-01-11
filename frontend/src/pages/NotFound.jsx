import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
    return (
        <div className="notfound-container">
            <div className="notfound-content">
                <h1>404</h1>
                <h2>Halaman Tidak Ditemukan</h2>
                <p>Maaf, halaman yang Anda cari tidak tersedia.</p>
                <Link to="/dashboard" className="btn-home">
                    Kembali ke Dashboard
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
