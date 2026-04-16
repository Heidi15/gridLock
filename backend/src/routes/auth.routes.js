const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { loginSchema, registerSchema } = require('../validators/schemas');

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', authMiddleware, logout);

module.exports = router;