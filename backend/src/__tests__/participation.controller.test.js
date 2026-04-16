require('../test/setup');
const prisma = require('../utils/prisma');
const { createParticipation } = require('../controllers/events.controller');

describe('createParticipation', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      params: { id: 'event-uuid-123' },
      body: { studentId: 'student-uuid-456', statut: 'confirme', estAmbassadeur: false },
      user: { id: 'admin-uuid-789' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  test('cas nominal : crée la participation et retourne 201', async () => {
    prisma.event.findUnique.mockResolvedValue({ id: 'event-uuid-123' });
    prisma.student.findUnique.mockResolvedValue({ id: 'student-uuid-456' });
    prisma.participation.count.mockResolvedValue(0); // pas de doublon
    prisma.participation.create.mockResolvedValue({
      id: 'part-uuid',
      eventId: 'event-uuid-123',
      studentId: 'student-uuid-456',
      statut: 'confirme',
      estAmbassadeur: false,
      student: { id: 'student-uuid-456', nom: 'MARTIN', prenom: 'Enzo', formation: 'B3' },
    });

    await createParticipation(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ statut: 'confirme' }));
  });

  test('409 si étudiant déjà inscrit', async () => {
    prisma.event.findUnique.mockResolvedValue({ id: 'event-uuid-123' });
    prisma.student.findUnique.mockResolvedValue({ id: 'student-uuid-456' });
    prisma.participation.count.mockResolvedValue(1); // doublon détecté

    await createParticipation(req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('déjà inscrit') })
    );
  });

  test('404 si événement introuvable', async () => {
    prisma.event.findUnique.mockResolvedValue(null);

    await createParticipation(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('Événement') })
    );
  });

  test('404 si étudiant introuvable', async () => {
    prisma.event.findUnique.mockResolvedValue({ id: 'event-uuid-123' });
    prisma.student.findUnique.mockResolvedValue(null);

    await createParticipation(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('Étudiant') })
    );
  });

  test('appelle next() en cas d\'erreur inattendue', async () => {
    prisma.event.findUnique.mockRejectedValue(new Error('DB down'));

    await createParticipation(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
