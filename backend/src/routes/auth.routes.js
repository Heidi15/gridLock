const express = require('express');
const router = express.Router();
const { login, logout } = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { loginSchema } = require('../validators/schemas');

router.post('/login', validate(loginSchema), login);
router.post('/logout', authMiddleware, logout);

module.exports = router;
