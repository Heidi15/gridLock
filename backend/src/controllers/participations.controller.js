const prisma = require('../utils/prisma');

/**
 * PUT /api/participations/:id
 * Met à jour le statut ou le flag ambassadeur d'une participation.
 * Admin/director uniquement.
 */
const updateParticipation = async (req, res, next) => {
  try {
    const existing = await prisma.participation.findUnique({
      where: { id: req.params.id },
      include: { event: { select: { dateEvent: true } } },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Participation introuvable.' });
    }

    const now = new Date();
    if (existing.event && new Date(existing.event.dateEvent) < now && req.user.role === 'student') {
      return res.status(403).json({ error: 'Vous ne pouvez pas modifier une participation passée.' });
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
 * Supprime une participation.
 * - Admin/Director : peut supprimer n'importe quelle participation
 * - Student : ne peut supprimer que sa propre participation
 */
const deleteParticipation = async (req, res, next) => {
  try {
    const participation = await prisma.participation.findUnique({
      where: { id: req.params.id },
    });

    if (!participation) {
      return res.status(404).json({ error: 'Participation introuvable.' });
    }

    // Contrôle d'accès : les étudiants ne peuvent supprimer que leur propre participation
    if (req.user.role === 'student') {
      if (!req.user.studentId || participation.studentId !== req.user.studentId) {
        return res.status(403).json({ error: "Vous ne pouvez supprimer que vos propres participations." });
      }
    }

    await prisma.participation.delete({ where: { id: req.params.id } });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = { updateParticipation, deleteParticipation };
