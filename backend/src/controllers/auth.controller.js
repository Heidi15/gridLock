const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');
const { generateToken } = require('../utils/jwt.utils');

/**
 * POST /api/auth/register
 * Inscription d'un nouvel étudiant.
 * L'email doit se terminer par @edu.esiee-it.fr.
 * Crée simultanément un Student et un User liés.
 */
const register = async (req, res, next) => {
  try {
    const { nom, prenom, email, password, formation, annee } = req.body;

    // Vérification domaine email
    if (!email.endsWith('@edu.esiee-it.fr')) {
      return res.status(400).json({ error: "L'email doit se terminer par @edu.esiee-it.fr." });
    }

    // Vérification unicité email
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Un compte avec cet email existe déjà.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Création dans une transaction : Student + User liés
    const result = await prisma.$transaction(async (tx) => {
      const student = await tx.student.upsert({
        where: { email },
        update: {},
        create: { nom: nom.toUpperCase(), prenom, email, formation, ...(annee && { annee }) },
      });

      const user = await tx.user.create({
        data: { email, passwordHash, role: 'student', studentId: student.id },
      });

      return { user, student };
    });

    const token = generateToken(result.user);

    res.status(201).json({
      token,
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        studentId: result.user.studentId,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 * Authentifie un utilisateur et retourne un JWT.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Identifiants invalides.' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Identifiants invalides.' });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role, studentId: user.studentId },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/logout
 * Déconnexion — côté serveur stateless (JWT), on retourne juste un 200.
 * La suppression du token est gérée côté frontend.
 */
const logout = (req, res) => {
  res.json({ message: 'Déconnecté.' });
};

module.exports = { register, login, logout };