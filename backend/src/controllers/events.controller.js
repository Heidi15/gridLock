const prisma = require('../utils/prisma');

const MOIS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

/**
 * Dérive le nom du mois en français depuis une date ISO.
 * @param {string} dateStr
 * @returns {string} Ex: 'Octobre'
 */
const getMoisFromDate = (dateStr) => {
  return MOIS_FR[new Date(dateStr).getMonth()];
};

/**
 * GET /api/events
 * Liste tous les événements avec filtres optionnels (type, mois, formation).
 */
const getEvents = async (req, res, next) => {
  try {
    const { type, mois } = req.query;

    const where = {};
    if (type) where.type = type;
    if (mois) where.mois = mois;

    const events = await prisma.event.findMany({
      where,
      orderBy: { dateEvent: 'desc' },
      include: {
        _count: { select: { participations: true } },
        creator: { select: { email: true } },
      },
    });

    res.json(events);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/events
 * Crée un nouvel événement (admin uniquement).
 */
const createEvent = async (req, res, next) => {
  try {
    const { type, dateEvent, nomStructure, nomEvenement, ville, horaires, besoins } = req.body;

    const event = await prisma.event.create({
      data: {
        mois: getMoisFromDate(dateEvent),
        type,
        dateEvent: new Date(dateEvent),
        nomStructure,
        nomEvenement,
        ville,
        horaires,
        besoins,
        createdBy: req.user.id,
      },
    });

    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/events/:id
 * Retourne un événement avec ses participations détaillées.
 */
const getEventById = async (req, res, next) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: {
        participations: {
          include: {
            student: {
              select: { id: true, nom: true, prenom: true, formation: true, email: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        creator: { select: { email: true } },
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Événement introuvable.' });
    }

    res.json(event);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/events/:id
 * Met à jour un événement (admin uniquement).
 */
const updateEvent = async (req, res, next) => {
  try {
    const existing = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Événement introuvable.' });
    }

    const data = { ...req.body };
    if (data.dateEvent) {
      data.mois = getMoisFromDate(data.dateEvent);
      data.dateEvent = new Date(data.dateEvent);
    }

    const event = await prisma.event.update({
      where: { id: req.params.id },
      data,
    });

    res.json(event);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/events/:id
 * Supprime un événement et ses participations (CASCADE en BDD).
 * Admin uniquement.
 */
const deleteEvent = async (req, res, next) => {
  try {
    const existing = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Événement introuvable.' });
    }

    await prisma.event.delete({ where: { id: req.params.id } });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/events/:id/participations
 * Liste les participations d'un événement.
 */
const getEventParticipations = async (req, res, next) => {
  try {
    const event = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!event) {
      return res.status(404).json({ error: 'Événement introuvable.' });
    }

    const participations = await prisma.participation.findMany({
      where: { eventId: req.params.id },
      include: {
        student: {
          select: { id: true, nom: true, prenom: true, formation: true, email: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json(participations);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/events/:id/participations
 * Inscrit un étudiant à un événement.
 *
 * Comportement selon le rôle :
 * - Admin/Director : peut inscrire n'importe quel étudiant (via studentId dans le body)
 * - Student : peut s'inscrire lui-même uniquement
 *
 * Vérification doublon AVANT insert : Prisma ne remonte pas d'erreur
 * suffisamment descriptive sur la contrainte UNIQUE en PostgreSQL.
 * La vérification explicite permet un message d'erreur métier précis (409).
 */
const createParticipation = async (req, res, next) => {
  try {
    const { studentId, statut, estAmbassadeur } = req.body;
    const eventId = req.params.id;

    // Vérifie l'existence de l'événement
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return res.status(404).json({ error: 'Événement introuvable.' });
    }

    const now = new Date();
    if (new Date(event.dateEvent) < now) {
      return res.status(400).json({ error: "Impossible d'inscrire un étudiant à un événement déjà passé." });
    }

    // Contrôle d'accès et détermination de l'étudiant cible
    let targetStudentId = studentId;
    if (req.user.role === 'student') {
      if (!req.user.studentId) {
        return res.status(403).json({ error: 'Aucun profil étudiant lié à ce compte.' });
      }
      // L'étudiant ne peut s'inscrire que pour lui-même
      if (studentId && studentId !== req.user.studentId) {
        return res.status(403).json({ error: "Vous ne pouvez vous inscrire que pour vous-même." });
      }
      targetStudentId = req.user.studentId;
    } else {
      // Les admins/directeurs doivent fournir un studentId
      if (!studentId) {
        return res.status(400).json({ error: "L'identifiant étudiant est requis pour les administrateurs." });
      }
    }

    // Vérifie l'existence de l'étudiant
    const student = await prisma.student.findUnique({ where: { id: targetStudentId } });
    if (!student) {
      return res.status(404).json({ error: 'Étudiant introuvable.' });
    }

    // Vérification doublon avant insert
    const existing = await prisma.participation.count({
      where: { eventId, studentId: targetStudentId },
    });

    if (existing > 0) {
      return res.status(409).json({ error: 'Cet étudiant est déjà inscrit à cet événement.' });
    }

    // Les étudiants s'inscrivent automatiquement en tant que "confirme"
    // Les admins peuvent définir le statut et le flag ambassadeur
    const data = {
      eventId,
      studentId: targetStudentId,
      statut: req.user.role === 'student' ? 'confirme' : (statut || 'confirme'),
      estAmbassadeur: req.user.role === 'student' ? false : (estAmbassadeur || false),
    };

    // Seuls les admins/directors définissent qui confirme la participation
    if (req.user.role !== 'student') {
      data.confirmePar = req.user.id;
    }

    const participation = await prisma.participation.create({
      data,
      include: {
        student: {
          select: { id: true, nom: true, prenom: true, formation: true },
        },
      },
    });

    res.status(201).json(participation);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getEvents,
  createEvent,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventParticipations,
  createParticipation,
};