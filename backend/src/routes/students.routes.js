const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');
const {
  searchStudents,
  getStudentById,
  getStudentParticipations,
  getMyParticipations,
} = require('../controllers/students.controller');

// Route /me AVANT /:id pour éviter le conflit de routing Express
router.get('/me/participations', auth, getMyParticipations);

router.get('/', auth, requireRole('admin', 'director'), searchStudents);
router.get('/:id', auth, requireRole('admin', 'director'), getStudentById);
router.get('/:id/participations', auth, requireRole('admin', 'director'), getStudentParticipations);

module.exports = router;
