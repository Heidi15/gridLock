const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const requireRole = require('../middleware/role.middleware');
const {
  getAllStudents,
  searchStudents,
  getStudentById,
  getStudentParticipations,
  updateStudent,
  deleteStudent,
  getMyParticipations,
} = require('../controllers/students.controller');
const { studentUpdateSchema } = require('../validators/schemas');

// Routes /me et /all avant /:id pour éviter les conflits de routing Express
router.get('/me/participations', auth, getMyParticipations);
router.get('/all', auth, requireRole('admin', 'director'), getAllStudents);

router.get('/', auth, requireRole('admin', 'director'), searchStudents);
router.get('/:id', auth, requireRole('admin', 'director'), getStudentById);
router.put('/:id', auth, requireRole('admin', 'director'), validate(studentUpdateSchema), updateStudent);
router.delete('/:id', auth, requireRole('admin', 'director'), deleteStudent);
router.get('/:id/participations', auth, requireRole('admin', 'director'), getStudentParticipations);

module.exports = router;