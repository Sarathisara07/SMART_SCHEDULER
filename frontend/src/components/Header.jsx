import React from 'react';
import { Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = ({ onMenuClick }) => {
    const { user } = useAuth();

    return (
        <header className="mobile-header glass-morphism">
            <button className="menu-toggle-btn" onClick={onMenuClick} aria-label="Toggle Navigation Menu">
                <Menu size={24} />
            </button>
            <div className="logo-container">
                <div className="logo-icon">S</div>
                <span className="logo-text">SmartSched</span>
            </div>
            <div className="mobile-user-avatar">
                {user?.profileImage && user.profileImage !== 'default-profile.png' ? (
                    <img src={user.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                ) : (
                    user?.name ? user.name[0].toUpperCase() : 'U'
                )}
            </div>
        </header>
    );
};

export default Header;
