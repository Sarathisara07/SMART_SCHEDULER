const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Please add a task title'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    date: {
        type: Date,
        required: [true, 'Please add a date']
    },
    time: {
        type: String,
        required: [true, 'Please add a time']
    },
    reminderType: {
        type: String,
        enum: ['One Time', 'Daily', 'Weekly', 'Monthly'],
        default: 'One Time'
    },
    priority: {
        type: String,
        enum: ['High', 'Medium', 'Low'],
        default: 'Medium'
    },
    category: {
        type: String,
        default: 'General'
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Snoozed'],
        default: 'Pending'
    },
    alarmSound: {
        type: String,
        default: 'beep'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Schedule', scheduleSchema);
