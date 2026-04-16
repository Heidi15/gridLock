const jwt = require('jsonwebtoken');

/**
 * Génère un JWT signé contenant l'id, l'email et le rôle de l'utilisateur.
 * @param {Object} user - Objet utilisateur Prisma
 * @returns {string} Token JWT
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, studentId: user.studentId ?? null },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

module.exports = { generateToken };
