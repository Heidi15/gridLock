const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const { eventCreateSchema, eventUpdateSchema, participationCreateSchema } = require('../validators/schemas');
const {
  getEvents,
  createEvent,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventParticipations,
  createParticipation,
} = require('../controllers/events.controller');

// Lecture : tous les rôles authentifiés peuvent voir les événements
router.get('/', auth, getEvents);
router.get('/:id', auth, getEventById);
router.get('/:id/participations', auth, getEventParticipations);

// Écriture : admin uniquement
router.post('/', auth, requireRole('admin'), validate(eventCreateSchema), createEvent);
router.put('/:id', auth, requireRole('admin'), validate(eventUpdateSchema), updateEvent);
router.delete('/:id', auth, requireRole('admin'), deleteEvent);

// Inscription : admin et director uniquement (ils inscrivent les étudiants)
// ← changed from open-to-all-authenticated to requireRole('admin', 'director')
router.post('/:id/participations', auth, requireRole('admin', 'director'), validate(participationCreateSchema), createParticipation);

module.exports = router;