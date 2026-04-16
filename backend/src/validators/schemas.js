const { z } = require('zod');

// ─── Auth ──────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email('Format email invalide.'),
  password: z.string().min(1, 'Le mot de passe est requis.'),
});

// ─── Événements ────────────────────────────────────────────────────────────
const eventCreateSchema = z.object({
  mois: z.string().min(1, 'Le mois est requis.'),
  type: z.enum(['JPO', 'Salon', 'Forum', 'Evenement'], {
    errorMap: () => ({ message: "Le type doit être JPO, Salon, Forum ou Evenement." }),
  }),
  dateEvent: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'La date est invalide.',
  }),
  nomStructure: z.string().min(1, 'Le nom de la structure est requis.'),
  nomEvenement: z.string().min(1, "Le nom de l'événement est requis."),
  ville: z.string().min(1, 'La ville est requise.'),
  horaires: z.string().optional(),
  besoins: z.string().optional(),
});

const eventUpdateSchema = eventCreateSchema.partial();

// ─── Participations ────────────────────────────────────────────────────────
const participationCreateSchema = z.object({
  studentId: z.string().uuid("L'identifiant étudiant doit être un UUID valide."),
  statut: z.enum(['confirme', 'present', 'absent']).default('confirme'),
  estAmbassadeur: z.boolean().default(false),
});

const participationUpdateSchema = z.object({
  statut: z.enum(['confirme', 'present', 'absent']).optional(),
  estAmbassadeur: z.boolean().optional(),
});

module.exports = {
  loginSchema,
  eventCreateSchema,
  eventUpdateSchema,
  participationCreateSchema,
  participationUpdateSchema,
};
