const { z } = require('zod');

// ─── Auth ──────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email('Format email invalide.'),
  password: z.string().min(1, 'Le mot de passe est requis.'),
});

const ANNEE_OPTIONS = [
  'B1', 'B2', 'B3', 'M1', 'M2',
  'ING 1', 'ING 2', 'ING 3', 'ING 4', 'ING 5',
];

const registerSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères.'),
  prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères.'),
  email: z
    .string()
    .email('Format email invalide.')
    .refine((v) => v.endsWith('@edu.esiee-it.fr'), {
      message: "L'email doit se terminer par @edu.esiee-it.fr.",
    }),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères.')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule.')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre.')
    .regex(/[^A-Za-z0-9]/, 'Le mot de passe doit contenir au moins un caractère spécial.'),
  formation: z.string().min(2, 'La formation est requise.'),
  annee: z.enum(ANNEE_OPTIONS, {
    errorMap: () => ({ message: 'L’année sélectionnée est invalide.' }),
  }).optional(),
});

const studentUpdateSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères.').optional(),
  prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères.').optional(),
  formation: z.string().min(2, 'La formation est requise.').optional(),
  annee: z.enum(ANNEE_OPTIONS, {
    errorMap: () => ({ message: 'L\'année sélectionnée est invalide.' }),
  }).optional(),
});

// ─── Événements ────────────────────────────────────────────────────────────
const eventCreateSchema = z.object({
  type: z.enum(['JPO', 'Salon', 'Forum', 'Evenement'], {
    errorMap: () => ({ message: 'Le type doit être JPO, Salon, Forum ou Evenement.' }),
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
  studentId: z.string().uuid("L'identifiant étudiant doit être un UUID valide.").optional(),
  statut: z.enum(['confirme', 'present', 'absent']).default('confirme'),
  estAmbassadeur: z.boolean().default(false),
});

const participationUpdateSchema = z.object({
  statut: z.enum(['confirme', 'present', 'absent']).optional(),
  estAmbassadeur: z.boolean().optional(),
});

module.exports = {
  loginSchema,
  registerSchema,
  studentUpdateSchema,
  eventCreateSchema,
  eventUpdateSchema,
  participationCreateSchema,
  participationUpdateSchema,
};