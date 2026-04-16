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

// Liste et création d'événements
router.get('/', auth, requireRole('admin', 'director'), getEvents);
router.post('/', auth, requireRole('admin'), validate(eventCreateSchema), createEvent);

// Détail, modification, suppression d'un événement
router.get('/:id', auth, requireRole('admin', 'director'), getEventById);
router.put('/:id', auth, requireRole('admin'), validate(eventUpdateSchema), updateEvent);
router.delete('/:id', auth, requireRole('admin'), deleteEvent);

// Participations d'un événement
router.get('/:id/participations', auth, requireRole('admin', 'director'), getEventParticipations);
router.post('/:id/participations', auth, requireRole('admin'), validate(participationCreateSchema), createParticipation);

module.exports = router;
