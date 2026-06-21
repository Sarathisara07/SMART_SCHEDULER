const Schedule = require('../models/Schedule');
const asyncHandler = require('../middleware/errorMiddleware');

// @desc    Get all schedules
// @route   GET /api/schedules
// @access  Private
const getSchedules = asyncHandler(async (req, res) => {
    const schedules = await Schedule.find({ user: req.user.id }).sort({ date: 1, time: 1 });
    res.status(200).json(schedules);
});

// @desc    Create schedule
// @route   POST /api/schedules
// @access  Private
const createSchedule = asyncHandler(async (req, res) => {
    const { title, description, date, time, reminderType, priority, category, alarmSound } = req.body;

    if (!title || !date || !time) {
        res.status(400);
        throw new Error('Please add title, date and time');
    }

    const schedule = await Schedule.create({
        user: req.user.id,
        title,
        description,
        date,
        time,
        reminderType,
        priority,
        category,
        alarmSound
    });

    res.status(201).json(schedule);
});

// @desc    Update schedule
// @route   PUT /api/schedules/:id
// @access  Private
const updateSchedule = asyncHandler(async (req, res) => {
    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
        res.status(404);
        throw new Error('Schedule not found');
    }

    // Make sure the logged in user matches the schedule user
    if (schedule.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const updatedSchedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });

    res.status(200).json(updatedSchedule);
});

// @desc    Delete schedule
// @route   DELETE /api/schedules/:id
// @access  Private
const deleteSchedule = asyncHandler(async (req, res) => {
    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
        res.status(404);
        throw new Error('Schedule not found');
    }

    // Make sure the logged in user matches the schedule user
    if (schedule.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    await schedule.deleteOne();

    res.status(200).json({ id: req.params.id });
});

module.exports = {
    getSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule
};
