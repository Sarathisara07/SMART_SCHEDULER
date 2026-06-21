import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Calendar, 
    CheckSquare, 
    Settings, 
    User, 
    LogOut,
    Bell,
    Moon,
    Sun,
    PlusCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
    const { logout, theme, toggleTheme, user } = useAuth();

    return (
        <aside className={`sidebar glass-morphism ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <div className="logo-container">
                    <div className="logo-icon">S</div>
                    <span className="logo-text">SmartSched</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                <p className="nav-label">Main Menu</p>
                <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={onClose}>
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </NavLink>
                <NavLink to="/schedules" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={onClose}>
                    <CheckSquare size={20} />
                    <span>My Tasks</span>
                </NavLink>
                <NavLink to="/calendar" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={onClose}>
                    <Calendar size={20} />
                    <span>Calendar</span>
                </NavLink>
                
                <p className="nav-label">Preferences</p>
                <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={onClose}>
                    <User size={20} />
                    <span>Profile</span>
                </NavLink>
                <div className="nav-item theme-toggle" onClick={toggleTheme}>
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                </div>
            </nav>

            <div className="sidebar-footer">
                <div className="user-info">
                    <div className="avatar">
                        {user?.profileImage && user.profileImage !== 'default-profile.png' ? (
                            <img src={user.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                        ) : (
                            user?.name?.[0].toUpperCase()
                        )}
                    </div>
                    <div className="user-details">
                        <span className="username">{user?.name}</span>
                        <span className="user-email">{user?.email}</span>
                    </div>
                </div>
                <button className="logout-btn" onClick={logout}>
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
