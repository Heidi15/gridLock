const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');
const { getDashboard } = require('../controllers/dashboard.controller');

router.get('/', auth, requireRole('admin', 'director'), getDashboard);

module.exports = router;
