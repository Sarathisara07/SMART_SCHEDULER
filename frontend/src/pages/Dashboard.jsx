import React, { useState, useEffect } from 'react';
import { useSchedules } from '../context/ScheduleContext';
import { useAuth } from '../context/AuthContext';
import { 
    Clock, 
    Calendar as CalendarIcon, 
    TrendingUp, 
    CheckCircle2, 
    AlertCircle,
    Plus
} from 'lucide-react';
import { format, isToday, isFuture, parseISO } from 'date-fns';
import ScheduleForm from '../components/ScheduleForm';
import './Dashboard.css';

const Dashboard = () => {
    const { schedules, loading } = useSchedules();
    const { user } = useAuth();
    const [isFormOpen, setIsFormOpen] = useState(false);

    const todaySchedules = schedules.filter(s => isToday(parseISO(s.date)));
    const upcomingSchedules = schedules.filter(s => isFuture(parseISO(s.date)) && !isToday(parseISO(s.date)));
    const completedCount = schedules.filter(s => s.status === 'Completed').length;
    const pendingCount = schedules.filter(s => s.status === 'Pending').length;

    const stats = [
        { label: 'Total Tasks', value: schedules.length, icon: <TrendingUp size={24} />, color: '#6366f1' },
        { label: 'Completed', value: completedCount, icon: <CheckCircle2 size={24} />, color: '#22c55e' },
        { label: 'Pending', value: pendingCount, icon: <Clock size={24} />, color: '#f59e0b' },
        { label: 'Important', value: schedules.filter(s => s.priority === 'High').length, icon: <AlertCircle size={24} />, color: '#ef4444' },
    ];

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="welcome-section">
                    <h1>Good Day, {user?.name}! 👋</h1>
                    <p>You have {todaySchedules.length} tasks scheduled for today.</p>
                </div>
                <button className="primary-btn" onClick={() => setIsFormOpen(true)}>
                    <Plus size={20} />
                    <span>Add New Task</span>
                </button>
            </header>

            <div className="stats-grid">
                {stats.map((stat, i) => (
                    <div key={i} className="stat-card premium-card">
                        <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                            {stat.icon}
                        </div>
                        <div className="stat-info">
                            <h3>{stat.value}</h3>
                            <p>{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-grid">
                <section className="dashboard-section">
                    <div className="section-header">
                        <h2>Today's Schedule</h2>
                        <span className="badge">{todaySchedules.length}</span>
                    </div>
                    <div className="schedule-list">
                        {todaySchedules.length > 0 ? (
                            todaySchedules.map(task => (
                                <div key={task._id} className="task-item premium-card">
                                    <div className={`priority-indicator ${task.priority.toLowerCase()}`}></div>
                                    <div className="task-content">
                                        <h4>{task.title}</h4>
                                        <p>{task.time} • {task.category}</p>
                                    </div>
                                    <div className="task-status">
                                        <span className={`status-pill ${task.status.toLowerCase()}`}>{task.status}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <p>No tasks for today. Relax! ☕</p>
                            </div>
                        )}
                    </div>
                </section>

                <section className="dashboard-section">
                    <div className="section-header">
                        <h2>Upcoming Tasks</h2>
                        <span className="badge">{upcomingSchedules.length}</span>
                    </div>
                    <div className="schedule-list">
                        {upcomingSchedules.slice(0, 5).map(task => (
                            <div key={task._id} className="task-item premium-card">
                                <div className="date-box">
                                    <span className="month">{format(parseISO(task.date), 'MMM')}</span>
                                    <span className="day">{format(parseISO(task.date), 'dd')}</span>
                                </div>
                                <div className="task-content">
                                    <h4>{task.title}</h4>
                                    <p>{task.time} • {task.reminderType}</p>
                                </div>
                                <div className="task-status">
                                    <span className={`priority-tag ${task.priority.toLowerCase()}`}>{task.priority}</span>
                                </div>
                            </div>
                        ))}
                        {upcomingSchedules.length === 0 && (
                            <div className="empty-state">
                                <p>No upcoming tasks found.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            <ScheduleForm 
                isOpen={isFormOpen} 
                onClose={() => setIsFormOpen(false)} 
            />
        </div>
    );
};

export default Dashboard;
