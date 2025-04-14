const express = require('express');
const { signup, login, verifyEmail } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', signup);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);


module.exports = router;
