import React, { useState } from 'react';
import { useSchedules } from '../context/ScheduleContext';
import { X, Calendar, Clock, Tag, AlertCircle, Volume2, VolumeX, Upload } from 'lucide-react';
import { ALARM_SOUNDS } from '../constants/alarmSounds';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './ScheduleForm.css';

const ScheduleForm = ({ isOpen, onClose, initialData = null, defaultDate = null }) => {
    const { addSchedule, updateSchedule } = useSchedules();
    const { user } = useAuth();
    
    const getInitialFormData = (data) => {
        if (!data) {
            return {
                title: '',
                description: '',
                date: defaultDate || '',
                time: '',
                reminderType: 'One Time',
                priority: 'Medium',
                category: 'Work',
                alarmSound: 'beep'
            };
        }
        return {
            title: data.title || '',
            description: data.description || '',
            date: data.date ? data.date.split('T')[0] : (defaultDate || ''),
            time: data.time || '',
            reminderType: data.reminderType || 'One Time',
            priority: data.priority || 'Medium',
            category: data.category || 'Work',
            alarmSound: data.alarmSound || 'beep'
        };
    };

    const [formData, setFormData] = useState(getInitialFormData(initialData));

    const [previewing, setPreviewing] = useState(false);
    const previewAudioRef = React.useRef(null);

    const [isUploadMode, setIsUploadMode] = React.useState(() => {
        if (!initialData?.alarmSound) return false;
        const isExistingCustom = !Object.keys(ALARM_SOUNDS).includes(initialData.alarmSound);
        return isExistingCustom && initialData.alarmSound.includes('/uploads/');
    });

    // Separate state to track if user chose "Custom URL..."
    const [isCustomMode, setIsCustomMode] = React.useState(() => {
        if (!initialData?.alarmSound) return false;
        const isExistingCustom = !Object.keys(ALARM_SOUNDS).includes(initialData.alarmSound);
        return isExistingCustom && !initialData.alarmSound.includes('/uploads/');
    });

    const [uploading, setUploading] = React.useState(false);
    const [uploadedFileName, setUploadedFileName] = React.useState('');
    const [uploadError, setUploadError] = React.useState(null);

    // Stop audio preview on unmount or close
    React.useEffect(() => {
        return () => {
            if (previewAudioRef.current) {
                previewAudioRef.current.pause();
                previewAudioRef.current = null;
            }
        };
    }, []);

    // Update form data if props change
    React.useEffect(() => {
        if (isOpen) {
            const parsed = getInitialFormData(initialData);
            setFormData(parsed);
            // Detect if the task's alarmSound is a custom URL
            const isExistingCustom = parsed.alarmSound && !Object.keys(ALARM_SOUNDS).includes(parsed.alarmSound);
            const isUploaded = isExistingCustom && parsed.alarmSound.includes('/uploads/');
            setIsCustomMode(!!isExistingCustom && !isUploaded);
            setIsUploadMode(!!isUploaded);
            
            if (isUploaded) {
                const parts = parsed.alarmSound.split('/');
                setUploadedFileName(parts[parts.length - 1]);
            } else {
                setUploadedFileName('');
            }
            
            setUploadError(null);
            setPreviewing(false);
            if (previewAudioRef.current) {
                previewAudioRef.current.pause();
                previewAudioRef.current = null;
            }
        }
    }, [isOpen, initialData, defaultDate]);

    const togglePreview = () => {
        if (previewing) {
            if (previewAudioRef.current) {
                previewAudioRef.current.pause();
                previewAudioRef.current.currentTime = 0;
            }
            setPreviewing(false);
        } else {
            let soundUrl = '';
            if (ALARM_SOUNDS[formData.alarmSound]) {
                soundUrl = ALARM_SOUNDS[formData.alarmSound].url;
            } else if (formData.alarmSound && (formData.alarmSound.startsWith('http://') || formData.alarmSound.startsWith('https://'))) {
                soundUrl = formData.alarmSound;
            }

            if (!soundUrl) {
                toast.error('Please enter a valid sound URL first');
                return;
            }

            if (previewAudioRef.current) {
                previewAudioRef.current.pause();
            }

            previewAudioRef.current = new Audio(soundUrl);
            previewAudioRef.current.play()
                .then(() => {
                    setPreviewing(true);
                    previewAudioRef.current.onended = () => {
                        setPreviewing(false);
                    };
                })
                .catch(err => {
                    console.error('Failed to play preview:', err);
                    toast.error('Could not load or play preview audio');
                    setPreviewing(false);
                });
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('audio/') && !file.name.endsWith('.mp3')) {
            setUploadError('Only MP3/audio files are allowed');
            toast.error('Only MP3/audio files are allowed');
            return;
        }

        const uploadFormData = new FormData();
        uploadFormData.append('audio', file);

        setUploading(true);
        setUploadError(null);

        try {
            const config = {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${user.token}` 
                }
            };
            const { data } = await axios.post('http://127.0.0.1:5000/api/schedules/upload-audio', uploadFormData, config);
            setFormData({ ...formData, alarmSound: data.url });
            setUploadedFileName(file.name);
            toast.success('Audio uploaded successfully!');
        } catch (err) {
            console.error('Upload error:', err);
            const errMsg = err.response?.data?.message || 'Failed to upload audio';
            setUploadError(errMsg);
            toast.error(errMsg);
        } finally {
            setUploading(false);
        }
    };

    const handleSoundChange = (e) => {
        const value = e.target.value;
        if (previewing && previewAudioRef.current) {
            previewAudioRef.current.pause();
            previewAudioRef.current = null;
            setPreviewing(false);
        }

        if (value === 'custom') {
            setIsCustomMode(true);
            setIsUploadMode(false);
            setFormData({ ...formData, alarmSound: '' });
        } else if (value === 'upload') {
            setIsCustomMode(false);
            setIsUploadMode(true);
            setFormData({ ...formData, alarmSound: '' });
            setUploadedFileName('');
        } else {
            setIsCustomMode(false);
            setIsUploadMode(false);
            setFormData({ ...formData, alarmSound: value });

            // Auto-play the selected preset sound
            const soundUrl = ALARM_SOUNDS[value]?.url;
            if (soundUrl) {
                previewAudioRef.current = new Audio(soundUrl);
                previewAudioRef.current.play()
                    .then(() => {
                        setPreviewing(true);
                        previewAudioRef.current.onended = () => {
                            setPreviewing(false);
                        };
                    })
                    .catch(err => console.log('Auto play preview failed:', err));
            }
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (initialData) {
                await updateSchedule(initialData._id, formData);
                toast.success('Task updated!');
            } else {
                await addSchedule(formData);
                toast.success('Task added successfully!');
            }
            onClose();
        } catch (error) {
            const message = error.response?.data?.message || 'Something went wrong. Please check your connection.';
            toast.error(message);
        }
    };

    const selectValue = isUploadMode ? 'upload' : (isCustomMode ? 'custom' : (formData.alarmSound || 'beep'));

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-morphism">
                <div className="modal-header">
                    <h2>{initialData ? 'Edit Task' : 'Create New Task'}</h2>
                    <button onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Task Title</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Morning Meeting"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Description (Optional)</label>
                        <textarea 
                            placeholder="Add some details..."
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label><Calendar size={14} /> Date</label>
                            <input 
                                type="date" 
                                value={formData.date}
                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label><Clock size={14} /> Time</label>
                            <input 
                                type="time" 
                                value={formData.time}
                                onChange={(e) => setFormData({...formData, time: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label><Tag size={14} /> Reminder Type</label>
                            <select 
                                value={formData.reminderType}
                                onChange={(e) => setFormData({...formData, reminderType: e.target.value})}
                            >
                                <option>One Time</option>
                                <option>Daily</option>
                                <option>Weekly</option>
                                <option>Monthly</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label><AlertCircle size={14} /> Priority</label>
                            <select 
                                value={formData.priority}
                                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                            >
                                <option>High</option>
                                <option>Medium</option>
                                <option>Low</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Category</label>
                        <select 
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                        >
                            <option>Work</option>
                            <option>Personal</option>
                            <option>Health</option>
                            <option>Education</option>
                            <option>Finance</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Alarm Sound</label>
                        <div className="alarm-sound-selector">
                            <select 
                                value={selectValue}
                                onChange={handleSoundChange}
                            >
                                {Object.entries(ALARM_SOUNDS).map(([key, sound]) => (
                                    <option key={key} value={key}>{sound.name}</option>
                                ))}
                                <option value="custom">Custom URL...</option>
                                <option value="upload">Upload Local MP3...</option>
                            </select>
                            <button 
                                type="button" 
                                className="preview-sound-btn" 
                                onClick={togglePreview}
                                title="Preview Sound"
                            >
                                {previewing ? <VolumeX size={18} /> : <Volume2 size={18} />}
                            </button>
                        </div>
                    </div>

                    {isCustomMode && (
                        <div className="form-group">
                            <label>Custom MP3 URL</label>
                            <input 
                                type="url" 
                                placeholder="https://example.com/audio.mp3"
                                value={formData.alarmSound || ''}
                                onChange={(e) => setFormData({...formData, alarmSound: e.target.value})}
                            />
                        </div>
                    )}

                    {isUploadMode && (
                        <div className="form-group upload-sound-group">
                            <label><Upload size={14} /> Upload Local MP3</label>
                            <div className="file-upload-wrapper">
                                <input 
                                    type="file" 
                                    accept="audio/mp3, audio/mpeg" 
                                    onChange={handleFileUpload} 
                                    id="mp3-file-input"
                                    className="hidden-file-input"
                                />
                                <label htmlFor="mp3-file-input" className="file-upload-btn">
                                    {uploading ? 'Uploading...' : 'Choose MP3 File'}
                                </label>
                                {uploadedFileName && (
                                    <span className="uploaded-file-name">{uploadedFileName}</span>
                                )}
                            </div>
                            {uploadError && <span className="upload-error">{uploadError}</span>}
                        </div>
                    )}

                    <button type="submit" className="submit-btn">
                        {initialData ? 'Update Task' : 'Save Task'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ScheduleForm;
