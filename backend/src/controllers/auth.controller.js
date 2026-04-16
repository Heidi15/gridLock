const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');
const { generateToken } = require('../utils/jwt.utils');

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

module.exports = { login, logout };
