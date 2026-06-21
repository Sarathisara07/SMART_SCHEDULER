import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useSchedules } from '../context/ScheduleContext';
import { User, Mail, Shield, Calendar, Settings, Camera, Loader2 } from 'lucide-react';
import './Profile.css';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const { schedules } = useSchedules();
    const [isUploading, setIsUploading] = useState(false);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setIsUploading(true);
        try {
            const config = {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${user.token}` 
                }
            };
            const { data } = await axios.post('http://127.0.0.1:5000/api/users/upload', formData, config);
            updateUser({ profileImage: data.profileImage });
            toast.success('Profile picture updated!');
        } catch (error) {
            toast.error('Upload failed. Check your Cloudinary keys.');
        } finally {
            setIsUploading(false);
        }
    };

    const completedPercentage = schedules.length > 0 
        ? Math.round((schedules.filter(s => s.status === 'Completed').length / schedules.length) * 100)
        : 0;

    return (
        <div className="profile-container dashboard-container">
            <header className="dashboard-header">
                <h1>User Profile</h1>
            </header>

            <div className="profile-grid">
                <div className="profile-info-card premium-card">
                    <div className="profile-avatar-wrapper">
                        <div className="profile-avatar-large">
                            {user?.profileImage && user.profileImage !== 'default-profile.png' ? (
                                <img src={user.profileImage} alt="Profile" className="avatar-img" />
                            ) : (
                                user?.name?.[0].toUpperCase()
                            )}
                        </div>
                        <label className="avatar-upload-label">
                            {isUploading ? <Loader2 className="spinner" size={18} /> : <Camera size={18} />}
                            <input type="file" hidden onChange={handleImageUpload} accept="image/*" />
                        </label>
                    </div>
                    <h2>{user?.name}</h2>
                    <p className="profile-badge">Pro Member</p>
                    
                    <div className="info-list">
                        <div className="info-item">
                            <Mail size={18} />
                            <span>{user?.email}</span>
                        </div>
                        <div className="info-item">
                            <Shield size={18} />
                            <span>Standard User</span>
                        </div>
                        <div className="info-item">
                            <Calendar size={18} />
                            <span>Joined June 2026</span>
                        </div>
                    </div>

                    <button className="edit-profile-btn">Edit Profile</button>
                </div>

                <div className="profile-stats-section">
                    <div className="stats-row">
                        <div className="stat-box premium-card">
                            <h3>{schedules.length}</h3>
                            <p>Total Tasks</p>
                        </div>
                        <div className="stat-box premium-card">
                            <h3>{completedPercentage}%</h3>
                            <p>Completion Rate</p>
                        </div>
                    </div>

                    <div className="progress-section premium-card">
                        <div className="progress-header">
                            <h3>Productivity Progress</h3>
                            <span>{completedPercentage}%</span>
                        </div>
                        <div className="progress-bar-container">
                            <div className="progress-bar" style={{ width: `${completedPercentage}%` }}></div>
                        </div>
                        <p>Keep it up! You're doing great this month.</p>
                    </div>

                    <div className="settings-quick-links premium-card">
                        <h3>Account Settings</h3>
                        <div className="settings-list">
                            <div className="settings-item">
                                <div className="settings-text">
                                    <h4>Email Notifications</h4>
                                    <p>Receive weekly schedule summary</p>
                                </div>
                                <input type="checkbox" defaultChecked />
                            </div>
                            <div className="settings-item">
                                <div className="settings-text">
                                    <h4>Dark Mode</h4>
                                    <p>Switch between light and dark themes</p>
                                </div>
                                <button className="toggle-preview">Active</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
