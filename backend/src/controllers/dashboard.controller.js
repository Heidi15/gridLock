const prisma = require('../utils/prisma');

/**
 * GET /api/dashboard
 * Retourne les données du tableau de bord selon le rôle :
 * - admin/director : total événements + total étudiants + prochain événement à venir
 * - student       : total participations, événements à venir, événements passés
 */
const getDashboard = async (req, res, next) => {
  try {
    const now = new Date();

    if (req.user.role === 'student') {
      // ─── Vue étudiant ────────────────────────────────────────────────────
      if (!req.user.studentId) {
        return res.status(403).json({ error: 'Aucun profil étudiant lié à ce compte.' });
      }

      const participations = await prisma.participation.findMany({
        where: { studentId: req.user.studentId },
        include: { event: { select: { dateEvent: true } } },
      });

      const totalParticipations = participations.length;
      const aVenir = participations.filter((p) => new Date(p.event.dateEvent) >= now).length;
      const passes = participations.filter((p) => new Date(p.event.dateEvent) < now).length;

      return res.json({ totalParticipations, aVenir, passes });
    }

    // ─── Vue admin/director ───────────────────────────────────────────────
    const [totalEvents, totalStudents, upcomingEvents, nextEvent] = await Promise.all([
      prisma.event.count(),
      prisma.student.count(),
      prisma.event.count({ where: { dateEvent: { gte: now } } }),
      prisma.event.findFirst({
        where: { dateEvent: { gte: now } },
        orderBy: { dateEvent: 'asc' },
        include: { _count: { select: { participations: true } } },
      }),
    ]);

    res.json({ totalEvents, totalStudents, upcomingEvents, nextEvent });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };