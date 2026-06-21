const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, uploadProfileImage } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../config/cloudinary');

router.post('/', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.post('/upload', protect, upload.single('image'), uploadProfileImage);

module.exports = router;
