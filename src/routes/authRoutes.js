const express = require('express');
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const { register, login } = require('../validations/authValidation');

const router = express.Router();

router.post('/register', validate(register), registerUser);
router.post('/login', validate(login), loginUser);
router.get('/me', protect, getMe);

module.exports = router;
