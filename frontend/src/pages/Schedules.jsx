import React, { useState } from 'react';
import { useSchedules } from '../context/ScheduleContext';
import { Search, Filter, Plus, Edit2, Trash2, CheckCircle } from 'lucide-react';
import ScheduleForm from '../components/ScheduleForm';
import toast from 'react-hot-toast';
import './Schedules.css';

const Schedules = () => {
    const { schedules, deleteSchedule, updateSchedule, addSchedule } = useSchedules();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    const filteredSchedules = schedules.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || task.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const handleEdit = (task) => {
        setEditingTask(task);
        setIsFormOpen(true);
    };

    const handleDelete = async (id) => {
        const taskToDelete = schedules.find(s => s._id === id);
        if (!taskToDelete) return;

        await deleteSchedule(id);

        // Guard to prevent double-click on Undo from saving twice
        let isRestoring = false;

        toast((t) => (
            <span className="undo-toast">
                Task "{taskToDelete.title}" deleted
                <button 
                    className="undo-btn"
                    onClick={async () => {
                        if (isRestoring) return;
                        isRestoring = true;
                        // Dismiss FIRST to prevent further clicks
                        toast.dismiss(t.id);
                        const { title, description, date, time, reminderType, priority, category, alarmSound } = taskToDelete;
                        try {
                            await addSchedule({
                                title, description, date, time, reminderType, priority, category, alarmSound
                            });
                            toast.success('Task restored!');
                        } catch (err) {
                            isRestoring = false;
                            toast.error('Failed to restore');
                        }
                    }}
                >
                    Undo
                </button>
            </span>
        ), { duration: 6000 });
    };

    const toggleComplete = async (task) => {
        const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
        await updateSchedule(task._id, { status: newStatus });
        toast.success(`Task marked as ${newStatus}`);
    };

    return (
        <div className="schedules-page dashboard-container">
            <header className="dashboard-header">
                <div className="title-section">
                    <h1>My Schedules</h1>
                    <p>Manage and organize your tasks</p>
                </div>
                <button className="primary-btn" onClick={() => { setEditingTask(null); setIsFormOpen(true); }}>
                    <Plus size={20} />
                    <span>New Task</span>
                </button>
            </header>

            <div className="controls-row">
                <div className="search-bar glass-morphism">
                    <Search size={18} />
                    <input 
                        type="text" 
                        placeholder="Search tasks..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <Filter size={18} />
                    <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                        <option>All</option>
                        <option>Work</option>
                        <option>Personal</option>
                        <option>Health</option>
                        <option>Education</option>
                        <option>Finance</option>
                    </select>
                </div>
            </div>

            <div className="schedules-grid">
                {filteredSchedules.map(task => (
                    <div key={task._id} className={`task-card premium-card ${task.status.toLowerCase()}`}>
                        <div className="task-card-header">
                            <span className={`priority-tag ${task.priority.toLowerCase()}`}>
                                {task.priority}
                            </span>
                            <div className="task-actions">
                                <button onClick={() => toggleComplete(task)} title="Toggle Complete">
                                    <CheckCircle size={18} color={task.status === 'Completed' ? '#22c55e' : '#94a3b8'} />
                                </button>
                                <button onClick={() => handleEdit(task)} title="Edit">
                                    <Edit2 size={18} />
                                </button>
                                <button onClick={() => handleDelete(task._id)} title="Delete">
                                    <Trash2 size={18} color="#ef4444" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="task-card-body">
                            <h3>{task.title}</h3>
                            <p className="task-desc">{task.description}</p>
                            <div className="task-meta">
                                <span className="task-date">{task.date.split('T')[0]}</span>
                                <span className="task-time">{task.time}</span>
                            </div>
                        </div>

                        <div className="task-card-footer">
                            <span className="category-pill">{task.category}</span>
                            <span className="type-pill">{task.reminderType}</span>
                        </div>
                    </div>
                ))}
            </div>

            {filteredSchedules.length === 0 && (
                <div className="empty-state">
                    <h3>No tasks found</h3>
                    <p>Try adjusting your search or filters</p>
                </div>
            )}

            <ScheduleForm 
                isOpen={isFormOpen} 
                onClose={() => setIsFormOpen(false)} 
                initialData={editingTask}
            />
        </div>
    );
};

export default Schedules;
