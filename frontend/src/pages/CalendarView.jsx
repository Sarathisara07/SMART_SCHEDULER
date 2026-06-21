import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { useSchedules } from '../context/ScheduleContext';
import { format, isSameDay, parseISO } from 'date-fns';
import { Plus } from 'lucide-react';
import ScheduleForm from '../components/ScheduleForm';
import 'react-calendar/dist/Calendar.css';
import './CalendarView.css';

const CalendarView = () => {
    const { schedules } = useSchedules();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isFormOpen, setIsFormOpen] = useState(false);

    const tasksOnSelectedDate = schedules.filter(task => 
        isSameDay(parseISO(task.date), selectedDate)
    );

    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const hasTask = schedules.some(task => isSameDay(parseISO(task.date), date));
            return hasTask ? <div className="dot"></div> : null;
        }
    };

    return (
        <div className="calendar-page dashboard-container">
            <header className="dashboard-header">
                <h1>Calendar View</h1>
            </header>

            <div className="calendar-grid">
                <div className="calendar-card premium-card">
                    <Calendar 
                        onChange={setSelectedDate} 
                        value={selectedDate}
                        tileContent={tileContent}
                    />
                </div>

                <div className="day-details premium-card">
                    <div className="day-header">
                        <div className="day-info">
                            <h2>{format(selectedDate, 'MMMM dd, yyyy')}</h2>
                            <span className="badge">{tasksOnSelectedDate.length} Tasks</span>
                        </div>
                        <button 
                            className="add-task-mini-btn" 
                            onClick={() => setIsFormOpen(true)}
                            title="Add task for this date"
                        >
                            <Plus size={18} />
                        </button>
                    </div>

                    <div className="day-tasks-list">
                        {tasksOnSelectedDate.length > 0 ? (
                            tasksOnSelectedDate.map(task => (
                                <div key={task._id} className="mini-task-item">
                                    <div className={`priority-dot ${task.priority.toLowerCase()}`}></div>
                                    <div className="mini-task-info">
                                        <h4>{task.title}</h4>
                                        <p>{task.time} • {task.category}</p>
                                    </div>
                                    <span className={`status-text ${task.status.toLowerCase()}`}>
                                        {task.status}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="empty-day">
                                <p>No tasks scheduled for this day.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ScheduleForm 
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                defaultDate={format(selectedDate, 'yyyy-MM-dd')}
            />
        </div>
    );
};

export default CalendarView;
