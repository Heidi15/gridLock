const jwt = require('jsonwebtoken');

/**
 * Middleware d'authentification JWT.
 * Vérifie la présence et la validité du token dans le header Authorization.
 *
 * Cas gérés :
 * - Token absent → 401
 * - Token malformé → 401
 * - Token expiré → 401 avec message spécifique (utilisé par le frontend pour le redirect)
 * - Token valide → injection de req.user et passage au middleware suivant
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant. Veuillez vous connecter.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expirée. Veuillez vous reconnecter.' });
    }
    return res.status(401).json({ error: 'Token invalide.' });
  }
};

module.exports = authMiddleware;
