const prisma = require('../utils/prisma');

/**
 * GET /api/dashboard
 * Retourne les KPIs globaux : total événements, participations, présents, ambassadeurs.
 * Accessible aux admins et directors uniquement.
 */
const getDashboard = async (req, res, next) => {
  try {
    const [
      totalEvents,
      totalParticipations,
      totalPresents,
      totalAmbassadeurs,
      byType,
      recentEvents,
    ] = await Promise.all([
      prisma.event.count(),
      prisma.participation.count(),
      prisma.participation.count({ where: { statut: 'present' } }),
      prisma.participation.count({ where: { estAmbassadeur: true } }),

      // Répartition par type d'événement
      prisma.event.groupBy({
        by: ['type'],
        _count: { id: true },
      }),

      // 5 événements les plus récents pour l'aperçu
      prisma.event.findMany({
        take: 5,
        orderBy: { dateEvent: 'desc' },
        include: {
          _count: { select: { participations: true } },
        },
      }),
    ]);

    res.json({
      totalEvents,
      totalParticipations,
      totalPresents,
      totalAmbassadeurs,
      byType: byType.map((b) => ({ type: b.type, count: b._count.id })),
      recentEvents,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };
