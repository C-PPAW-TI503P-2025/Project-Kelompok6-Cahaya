import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import './MainLayout.css';

const MainLayout = () => {
    return (
        <div className="app-container">
            <Header />
            <div className="main-content">
                <Sidebar />
                <main className="content-area">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
