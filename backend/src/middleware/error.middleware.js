/**
 * Middleware global de gestion des erreurs (doit être déclaré en dernier dans app.js).
 *
 * - Les erreurs métier connues (400, 401, 403, 404, 409) retournent un message explicite.
 * - Les erreurs techniques (500) retournent un message générique.
 * - La stack trace n'est JAMAIS envoyée au client (cf. US13).
 */
const errorHandler = (err, req, res, next) => {
  // Log côté serveur uniquement
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[${new Date().toISOString()}] ERROR ${req.method} ${req.path}:`, err.message);
  }

  const status = err.status || err.statusCode || 500;

  if (status < 500) {
    return res.status(status).json({ error: err.message });
  }

  res.status(500).json({
    error: 'Une erreur est survenue. Veuillez réessayer ou contacter l\'administrateur.',
  });
};

module.exports = errorHandler;
