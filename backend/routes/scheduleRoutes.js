const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const {
    getSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule
} = require('../controllers/scheduleController');
const { protect } = require('../middleware/authMiddleware');

// Configure disk storage for local MP3 uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'audio-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('audio/') || file.originalname.endsWith('.mp3')) {
            cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed!'), false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
});

// Upload route
router.post('/upload-audio', protect, upload.single('audio'), (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('Please upload an audio file');
    }
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.status(200).json({
        url: fileUrl,
        filename: req.file.filename,
        originalname: req.file.originalname
    });
});

router.route('/').get(protect, getSchedules).post(protect, createSchedule);
router.route('/:id').put(protect, updateSchedule).delete(protect, deleteSchedule);

module.exports = router;
