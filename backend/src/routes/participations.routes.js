const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const { participationUpdateSchema } = require('../validators/schemas');
const { updateParticipation, deleteParticipation } = require('../controllers/participations.controller');

router.put('/:id', auth, requireRole('admin'), validate(participationUpdateSchema), updateParticipation);
router.delete('/:id', auth, requireRole('admin'), deleteParticipation);

module.exports = router;
