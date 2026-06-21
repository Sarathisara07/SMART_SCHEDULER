import React, { useState, useEffect, useRef } from 'react';
import { useSchedules } from '../context/ScheduleContext';
import { format, parseISO, isSameMinute, startOfMinute } from 'date-fns';
import { Bell, Clock, X, Volume2, VolumeX } from 'lucide-react';
import toast from 'react-hot-toast';
import { ALARM_SOUNDS } from '../constants/alarmSounds';
import './ReminderSystem.css';

const ReminderSystem = () => {
    const { schedules, updateSchedule } = useSchedules();
    const [activeReminder, setActiveReminder] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef(null);

    // Request notification permission
    useEffect(() => {
        if ('Notification' in window) {
            Notification.requestPermission();
        }
    }, []);

    useEffect(() => {
        const checkReminders = () => {
            const now = new Date();
            const currentTimeStr = format(now, 'HH:mm');
            const currentDateStr = format(now, 'yyyy-MM-dd');

            const dueTask = schedules.find(task => {
                const taskDate = format(parseISO(task.date), 'yyyy-MM-dd');
                return taskDate === currentDateStr && task.time === currentTimeStr && task.status === 'Pending';
            });

            if (dueTask && (!activeReminder || activeReminder._id !== dueTask._id)) {
                triggerReminder(dueTask);
            }
        };

        const interval = setInterval(checkReminders, 10000); // Check every 10 seconds
        return () => clearInterval(interval);
    }, [schedules, activeReminder]);

    const triggerReminder = (task) => {
        setActiveReminder(task);
        
        // Browser Notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`Reminder: ${task.title}`, {
                body: task.description || `It's ${task.time}!`,
                icon: '/logo-icon.png'
            });
        }

        // Play Sound
        if (!isMuted && audioRef.current) {
            let soundUrl = '';
            if (task.alarmSound && (task.alarmSound.startsWith('http://') || task.alarmSound.startsWith('https://'))) {
                soundUrl = task.alarmSound;
            } else {
                const preset = ALARM_SOUNDS[task.alarmSound || 'beep'];
                soundUrl = preset ? preset.url : ALARM_SOUNDS['beep'].url;
            }

            audioRef.current.src = soundUrl;
            audioRef.current.load();
            audioRef.current.play().catch(e => console.log('Audio play failed:', e));
        }
        
        toast(`Time for: ${task.title}`, {
            icon: '🔔',
            duration: 5000
        });
    };

    const stopAlarm = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setActiveReminder(null);
    };

    const completeTask = async () => {
        if (activeReminder) {
            await updateSchedule(activeReminder._id, { status: 'Completed' });
            stopAlarm();
            toast.success('Task marked as completed!');
        }
    };

    const snoozeReminder = async (minutes) => {
        stopAlarm();
        const now = new Date();
        const snoozeDate = new Date(now.getTime() + minutes * 60000);
        const newTime = format(snoozeDate, 'HH:mm');
        
        try {
            await updateSchedule(activeReminder._id, { 
                time: newTime,
                status: 'Pending' // Keep it pending so it triggers again
            });
            toast.success(`Snoozed for ${minutes} minutes. New time: ${newTime}`, { icon: '⏲️' });
        } catch (error) {
            toast.error('Failed to snooze');
        }
    };

    return (
        <>
            <audio 
                ref={audioRef} 
                src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" 
                loop 
            />
            
            {activeReminder && (
                <div className="reminder-modal-overlay">
                    <div className="reminder-modal glass-morphism">
                        <div className="reminder-icon-pulse">
                            <Bell size={40} />
                        </div>
                        <h2>{activeReminder.title}</h2>
                        <p className="reminder-time">Scheduled for {activeReminder.time}</p>
                        <p className="reminder-desc">{activeReminder.description}</p>
                        
                        <div className="reminder-actions">
                            <button className="complete-btn" onClick={completeTask}>
                                Mark as Done
                            </button>
                            
                            <div className="snooze-options">
                                <button className="snooze-btn" onClick={() => snoozeReminder(10)}>
                                    Snooze 10m
                                </button>
                                <button className="snooze-btn" onClick={() => snoozeReminder(30)}>
                                    Snooze 30m
                                </button>
                                <button className="snooze-btn" onClick={() => snoozeReminder(60)}>
                                    Snooze 1h
                                </button>
                            </div>

                            <button className="stop-btn" onClick={stopAlarm}>
                                Stop Alarm
                            </button>
                        </div>

                        <button className="close-reminder" onClick={stopAlarm}>
                            <X size={20} />
                        </button>

                        <button 
                            className="mute-toggle" 
                            onClick={() => setIsMuted(!isMuted)}
                        >
                            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ReminderSystem;
