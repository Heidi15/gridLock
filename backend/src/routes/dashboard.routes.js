const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const { getDashboard } = require('../controllers/dashboard.controller');

// Accessible à tous les rôles authentifiés — le controller filtre par rôle
router.get('/', auth, getDashboard);

module.exports = router;