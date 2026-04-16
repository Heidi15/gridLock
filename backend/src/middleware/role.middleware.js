/**
 * Middleware de vérification du rôle utilisateur.
 * Doit être utilisé APRÈS authMiddleware (req.user doit être défini).
 *
 * Le rôle est toujours vérifié côté API, jamais seulement côté frontend (cf. US20).
 *
 * @param {...string} roles - Rôles autorisés pour cette route
 * @returns {Function} Middleware Express
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Vous n'avez pas les droits pour effectuer cette action.",
      });
    }

    next();
  };
};

module.exports = requireRole;
