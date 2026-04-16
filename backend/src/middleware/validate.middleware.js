/**
 * Factory de middleware de validation Zod.
 * Valide req.body contre un schéma Zod et retourne 400 si invalide.
 *
 * @param {import('zod').ZodSchema} schema - Schéma Zod à valider
 * @returns {Function} Middleware Express
 */
const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return res.status(400).json({ error: 'Données invalides.', details: errors });
    }

    req.body = result.data;
    next();
  };
};

module.exports = validate;
