const prisma = require('../utils/prisma');

/**
 * PUT /api/participations/:id
 * Met à jour le statut ou le flag ambassadeur d'une participation.
 * Admin uniquement.
 */
const updateParticipation = async (req, res, next) => {
  try {
    const existing = await prisma.participation.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Participation introuvable.' });
    }

    const data = {};
    if (req.body.statut !== undefined) { data.statut = req.body.statut; }
    if (req.body.estAmbassadeur !== undefined) { data.estAmbassadeur = req.body.estAmbassadeur; }

    const participation = await prisma.participation.update({
      where: { id: req.params.id },
      data,
      include: {
        student: { select: { id: true, nom: true, prenom: true, formation: true } },
      },
    });

    res.json(participation);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/participations/:id
 * Supprime une participation. Admin uniquement.
 */
const deleteParticipation = async (req, res, next) => {
  try {
    const existing = await prisma.participation.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Participation introuvable.' });
    }

    await prisma.participation.delete({ where: { id: req.params.id } });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = { updateParticipation, deleteParticipation };
