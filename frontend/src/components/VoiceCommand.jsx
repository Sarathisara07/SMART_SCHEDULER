import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Loader2, Play } from 'lucide-react';
import { useSchedules } from '../context/ScheduleContext';
import toast from 'react-hot-toast';
import './VoiceCommand.css';

const VoiceCommand = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const { addSchedule } = useSchedules();

    // Browser Speech Recognition Setup
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = SpeechRecognition ? new SpeechRecognition() : null;

    if (recognition) {
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        
        recognition.onresult = (event) => {
            const currentTranscript = event.results[0][0].transcript;
            setTranscript(currentTranscript);
            parseAndAddTask(currentTranscript);
        };
    }

    const startListening = () => {
        if (!recognition) {
            toast.error('Voice recognition not supported in this browser');
            return;
        }
        recognition.start();
    };

    const parseAndAddTask = async (text) => {
        const lowerText = text.toLowerCase();
        toast(`Processing: "${text}"`, { icon: '🤖' });

        // Simple Regex Parsing Logic
        // Example: "Remind me at 5 PM for gym" or "Create task Meeting at 14:00"
        
        let title = "Voice Task";
        let time = "12:00";
        let date = new Date().toISOString().split('T')[0];

        // Extract title (usually after "for" or "task")
        const forMatch = lowerText.match(/(?:for|task)\s+(.*)/);
        if (forMatch) title = forMatch[1].split(' at ')[0];

        // Extract time
        const timeMatch = lowerText.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm|am.|pm.))/);
        const militaryTimeMatch = lowerText.match(/(\d{1,2}:\d{2})/);

        if (timeMatch) {
            let t = timeMatch[0].replace(/\./g, '').trim();
            // Convert to 24hr for DB
            const [val, ampm] = [t.match(/\d+/)[0], t.match(/[a-z]+/)[0]];
            let hours = parseInt(val);
            if (ampm === 'pm' && hours < 12) hours += 12;
            if (ampm === 'am' && hours === 12) hours = 0;
            time = `${hours.toString().padStart(2, '0')}:00`;
        } else if (militaryTimeMatch) {
            time = militaryTimeMatch[0];
        }

        try {
            await addSchedule({
                title: title.charAt(0).toUpperCase() + title.slice(1),
                date,
                time,
                description: `Created via voice: "${text}"`,
                priority: 'Medium',
                category: 'Personal',
                reminderType: 'One Time'
            });
            toast.success('Voice task added successfully!');
        } catch (error) {
            toast.error('Failed to create task from voice');
        }
    };

    return (
        <div className="voice-command-container">
            <button 
                className={`voice-btn ${isListening ? 'listening' : ''}`} 
                onClick={isListening ? () => recognition.stop() : startListening}
                title="Use voice to add task"
            >
                {isListening ? <Loader2 className="spinner" size={24} /> : <Mic size={24} />}
            </button>
            {isListening && <div className="listening-pulse"></div>}
            {transcript && !isListening && (
                <div className="transcript-preview glass-morphism">
                    <p>"{transcript}"</p>
                </div>
            )}
        </div>
    );
};

export default VoiceCommand;
