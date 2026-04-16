const prisma = require('../utils/prisma');

/**
 * GET /api/students/all
 * Retourne tous les étudiants pour l'affichage de la liste complète.
 * Accessible aux admins et directors uniquement.
 */
const getAllStudents = async (req, res, next) => {
  try {
    const students = await prisma.student.findMany({
      select: {
        id: true, nom: true, prenom: true, formation: true, email: true, annee: true,
        _count: { select: { participations: true } },
      },
      orderBy: [{ nom: 'asc' }, { prenom: 'asc' }],
    });
    res.json(students);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/students?q=
 * Auto-complétion sur le nom/prénom d'un étudiant. Minimum 2 caractères.
 * Accessible aux admins et directors uniquement.
 */
const searchStudents = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'Paramètre q requis (minimum 2 caractères).' });
    }

    const students = await prisma.student.findMany({
      where: {
        OR: [
          { nom: { contains: q, mode: 'insensitive' } },
          { prenom: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { id: true, nom: true, prenom: true, formation: true, email: true },
      take: 10,
      orderBy: { nom: 'asc' },
    });

    res.json(students);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/students/:id
 * Retourne le profil complet d'un étudiant.
 */
const getStudentById = async (req, res, next) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: req.params.id },
    });

    if (!student) {
      return res.status(404).json({ error: 'Étudiant introuvable.' });
    }

    res.json(student);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/students/:id
 * Modifie le nom, le prénom et la formation d'un étudiant.
 */
const updateStudent = async (req, res, next) => {
  try {
    const { nom, prenom, formation, annee } = req.body;

    const existing = await prisma.student.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Étudiant introuvable.' });
    }

    const data = {};
    if (nom !== undefined) data.nom = nom.toUpperCase();
    if (prenom !== undefined) data.prenom = prenom;
    if (formation !== undefined) data.formation = formation;
    if (annee !== undefined) data.annee = annee;

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'Aucune donnée à mettre à jour.' });
    }

    const student = await prisma.student.update({
      where: { id: req.params.id },
      data,
    });

    res.json(student);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/students/:id
 * Supprime un étudiant et son compte utilisateur associé.
 */
const deleteStudent = async (req, res, next) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: req.params.id },
      include: { user: true },
    });

    if (!student) {
      return res.status(404).json({ error: 'Étudiant introuvable.' });
    }

    // Suppression en transaction pour assurer l'intégrité
    await prisma.$transaction(async (tx) => {
      // Supprimer les participations de l'étudiant
      await tx.participation.deleteMany({
        where: { studentId: req.params.id },
      });

      // Supprimer l'utilisateur associé
      if (student.user.length > 0) {
        await tx.user.deleteMany({
          where: { studentId: req.params.id },
        });
      }

      // Supprimer l'étudiant
      await tx.student.delete({
        where: { id: req.params.id },
      });
    });

    res.json({ message: 'Étudiant supprimé avec succès.' });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/students/:id/participations
 * Historique des participations d'un étudiant donné (admin/director).
 */
const getStudentParticipations = async (req, res, next) => {
  try {
    const student = await prisma.student.findUnique({ where: { id: req.params.id } });
    if (!student) {
      return res.status(404).json({ error: 'Étudiant introuvable.' });
    }

    const participations = await prisma.participation.findMany({
      where: { studentId: req.params.id },
      include: {
        event: {
          select: {
            id: true, nomEvenement: true, type: true, dateEvent: true, ville: true, mois: true,
          },
        },
      },
      orderBy: { event: { dateEvent: 'desc' } },
    });

    res.json({ student, participations });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/students/me/participations
 * Historique des participations de l'étudiant connecté.
 * Utilise req.user.studentId injecté par le JWT.
 */
const getMyParticipations = async (req, res, next) => {
  try {
    if (!req.user.studentId) {
      return res.status(403).json({ error: "Aucun profil étudiant lié à ce compte." });
    }

    const participations = await prisma.participation.findMany({
      where: { studentId: req.user.studentId },
      include: {
        event: {
          select: {
            id: true, nomEvenement: true, type: true, dateEvent: true, ville: true, mois: true,
          },
        },
      },
      orderBy: { event: { dateEvent: 'desc' } },
    });

    const student = await prisma.student.findUnique({
      where: { id: req.user.studentId },
    });

    res.json({ student, participations });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllStudents, searchStudents, getStudentById, getStudentParticipations, updateStudent, deleteStudent, getMyParticipations };