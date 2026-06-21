import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { API_URL } from '../config';

const ScheduleContext = createContext();

export const ScheduleProvider = ({ children }) => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const fetchSchedules = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            const { data } = await axios.get(`${API_URL}/api/schedules`, config);
            setSchedules(data);
        } catch (error) {
            console.error('Error fetching schedules:', error);
        } finally {
            setLoading(false);
        }
    };

    const addSchedule = async (scheduleData) => {
        const config = {
            headers: { Authorization: `Bearer ${user.token}` }
        };
        const { data } = await axios.post(`${API_URL}/api/schedules`, scheduleData, config);
        setSchedules([...schedules, data]);
        return data;
    };

    const updateSchedule = async (id, scheduleData) => {
        const config = {
            headers: { Authorization: `Bearer ${user.token}` }
        };
        const { data } = await axios.put(`${API_URL}/api/schedules/${id}`, scheduleData, config);
        setSchedules(schedules.map(s => s._id === id ? data : s));
        return data;
    };

    const deleteSchedule = async (id) => {
        const config = {
            headers: { Authorization: `Bearer ${user.token}` }
        };
        await axios.delete(`${API_URL}/api/schedules/${id}`, config);
        setSchedules(schedules.filter(s => s._id !== id));
    };

    useEffect(() => {
        fetchSchedules();
    }, [user]);

    return (
        <ScheduleContext.Provider value={{ schedules, loading, addSchedule, updateSchedule, deleteSchedule, fetchSchedules }}>
            {children}
        </ScheduleContext.Provider>
    );
};

export const useSchedules = () => useContext(ScheduleContext);
