/**
 * Tests d'intégration — Événements & Participations (US30)
 * Couvre le parcours principal de Sophie : créer un événement, inscrire un étudiant,
 * gérer les doublons, vérifier les droits.
 */
process.env.JWT_SECRET = 'integration_test_secret';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../utils/prisma', () => ({
  event: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
    findFirst: jest.fn(),
  },
  student: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  participation: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  user: { findUnique: jest.fn() },
  $disconnect: jest.fn(),
}));

const app = require('../app');
const prisma = require('../utils/prisma');

// ─── Helpers ────────────────────────────────────────────────────────────────
const makeToken = (role, extra = {}) =>
  jwt.sign({ id: `00000000-0000-0000-0000-00000000000${role === 'admin' ? '1' : role === 'director' ? '2' : '3'}`, email: `${role}@test.fr`, role, ...extra }, 'integration_test_secret', { expiresIn: '1h' });

const adminToken = makeToken('admin');
const directorToken = makeToken('director');
const studentToken = makeToken('student', { studentId: 'a0000000-0000-0000-0000-000000000001' });

const mockEvent = {
  id: 'b0000000-0000-0000-0000-000000000001',
  mois: 'Avril',
  type: 'JPO',
  dateEvent: '2027-04-20', // ← future date so past-event guard never triggers
  nomStructure: 'ESIEE-IT Cergy',
  nomEvenement: 'JPO Printemps',
  ville: 'Cergy',
  horaires: '10h - 17h',
  besoins: '3 étudiants',
  createdBy: '00000000-0000-0000-0000-000000000001',
  _count: { participations: 2 },
};

// ─── GET /api/events ────────────────────────────────────────────────────────
describe('GET /api/events', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 — admin peut lister les événements', async () => {
    prisma.event.findMany.mockResolvedValue([mockEvent]);

    const res = await request(app)
      .get('/api/events')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('200 — étudiant peut aussi lister les événements (lecture publique)', async () => {
    prisma.event.findMany.mockResolvedValue([mockEvent]);

    const res = await request(app)
      .get('/api/events')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
  });

  test('401 — sans token, accès refusé', async () => {
    const res = await request(app).get('/api/events');
    expect(res.status).toBe(401);
  });
});

// ─── POST /api/events ───────────────────────────────────────────────────────
describe('POST /api/events', () => {
  beforeEach(() => jest.clearAllMocks());

  const validPayload = {
    type: 'JPO',
    dateEvent: '2026-05-15',
    nomStructure: 'ESIEE-IT Pontoise',
    nomEvenement: 'JPO Été',
    ville: 'Pontoise',
    horaires: '10h - 17h',
  };

  test('201 — admin crée un événement', async () => {
    prisma.event.create.mockResolvedValue({ id: 'new-event-uuid', ...validPayload, mois: 'Mai' });

    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  test('403 — director ne peut pas créer un événement', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${directorToken}`)
      .send(validPayload);

    expect(res.status).toBe(403);
  });

  test('403 — étudiant ne peut pas créer un événement', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${studentToken}`)
      .send(validPayload);

    expect(res.status).toBe(403);
  });

  test('400 — champ obligatoire manquant (nomEvenement)', async () => {
    const { nomEvenement, ...incomplete } = validPayload;

    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(incomplete);

    expect(res.status).toBe(400);
    expect(res.body.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'nomEvenement' })])
    );
  });

  test('400 — type invalide', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...validPayload, type: 'Conférence' });

    expect(res.status).toBe(400);
  });
});

// ─── POST /api/events/:id/participations ────────────────────────────────────
describe('POST /api/events/:id/participations', () => {
  beforeEach(() => jest.clearAllMocks());

  test('201 — admin inscrit un étudiant (cas nominal)', async () => {
    prisma.event.findUnique.mockResolvedValue(mockEvent);
    prisma.student.findUnique.mockResolvedValue({ id: 'a0000000-0000-0000-0000-000000000001', nom: 'MARTIN', prenom: 'Enzo', formation: 'B3' });
    prisma.participation.count.mockResolvedValue(0);
    prisma.participation.create.mockResolvedValue({
      id: 'c0000000-0000-0000-0000-000000000001',
      eventId: 'b0000000-0000-0000-0000-000000000001',
      studentId: 'a0000000-0000-0000-0000-000000000001',
      statut: 'confirme',
      estAmbassadeur: false,
      student: { id: 'a0000000-0000-0000-0000-000000000001', nom: 'MARTIN', prenom: 'Enzo', formation: 'B3' },
    });

    const res = await request(app)
      .post('/api/events/b0000000-0000-0000-0000-000000000001/participations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ studentId: 'a0000000-0000-0000-0000-000000000001', statut: 'confirme', estAmbassadeur: false });

    expect(res.status).toBe(201);
    expect(res.body.statut).toBe('confirme');
  });

  test('409 — étudiant déjà inscrit', async () => {
    prisma.event.findUnique.mockResolvedValue(mockEvent);
    prisma.student.findUnique.mockResolvedValue({ id: 'a0000000-0000-0000-0000-000000000001' });
    prisma.participation.count.mockResolvedValue(1); // doublon

    const res = await request(app)
      .post('/api/events/b0000000-0000-0000-0000-000000000001/participations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ studentId: 'a0000000-0000-0000-0000-000000000001', statut: 'confirme', estAmbassadeur: false });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/déjà inscrit/i);
  });

  test('404 — événement inexistant', async () => {
    prisma.event.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/events/d0000000-0000-0000-0000-000000000001/participations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ studentId: 'a0000000-0000-0000-0000-000000000001', statut: 'confirme', estAmbassadeur: false });

    expect(res.status).toBe(404);
  });

  // ← requireRole('admin', 'director') on the route blocks students before controller runs,
  //   so no DB mocks are needed — the middleware rejects immediately
  test('403 — étudiant ne peut pas s\'inscrire via cette route', async () => {
    const res = await request(app)
      .post('/api/events/b0000000-0000-0000-0000-000000000001/participations')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ studentId: 'a0000000-0000-0000-0000-000000000001', statut: 'confirme', estAmbassadeur: false });

    expect(res.status).toBe(403);
  });

  test('400 — studentId n\'est pas un UUID valide', async () => {
    const res = await request(app)
      .post('/api/events/b0000000-0000-0000-0000-000000000001/participations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ studentId: 'pas-un-uuid', statut: 'confirme', estAmbassadeur: false });

    expect(res.status).toBe(400);
  });
});

// ─── PUT /api/participations/:id ────────────────────────────────────────────
describe('PUT /api/participations/:id', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 — admin change le statut d\'une participation', async () => {
    prisma.participation.findUnique.mockResolvedValue({ id: 'c0000000-0000-0000-0000-000000000001', statut: 'confirme' });
    prisma.participation.update.mockResolvedValue({
      id: 'c0000000-0000-0000-0000-000000000001',
      statut: 'present',
      student: { id: 'a0000000-0000-0000-0000-000000000001', nom: 'MARTIN', prenom: 'Enzo', formation: 'B3' },
    });

    const res = await request(app)
      .put('/api/participations/c0000000-0000-0000-0000-000000000001')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ statut: 'present' });

    expect(res.status).toBe(200);
    expect(res.body.statut).toBe('present');
  });

  test('404 — participation inexistante', async () => {
    prisma.participation.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/participations/e0000000-0000-0000-0000-000000000001')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ statut: 'present' });

    expect(res.status).toBe(404);
  });

  // ← director IS explicitly allowed by requireRole('admin', 'director') on this route
  test('200 — director peut aussi modifier une participation', async () => {
    prisma.participation.findUnique.mockResolvedValue({
      id: 'c0000000-0000-0000-0000-000000000001',
      statut: 'confirme',
    });
    prisma.participation.update.mockResolvedValue({
      id: 'c0000000-0000-0000-0000-000000000001',
      statut: 'present',
      student: { id: 'a0000000-0000-0000-0000-000000000001', nom: 'MARTIN', prenom: 'Enzo', formation: 'B3' },
    });

    const res = await request(app)
      .put('/api/participations/c0000000-0000-0000-0000-000000000001')
      .set('Authorization', `Bearer ${directorToken}`)
      .send({ statut: 'present' });

    expect(res.status).toBe(200);
    expect(res.body.statut).toBe('present');
  });

  // ← student is NOT in requireRole('admin', 'director') — blocked by middleware
  test('403 — étudiant ne peut pas modifier une participation', async () => {
    const res = await request(app)
      .put('/api/participations/c0000000-0000-0000-0000-000000000001')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ statut: 'present' });

    expect(res.status).toBe(403);
  });
});

// ─── DELETE /api/events/:id ─────────────────────────────────────────────────
describe('DELETE /api/events/:id', () => {
  beforeEach(() => jest.clearAllMocks());

  test('204 — admin supprime un événement', async () => {
    prisma.event.findUnique.mockResolvedValue(mockEvent);
    prisma.event.delete.mockResolvedValue(mockEvent);

    const res = await request(app)
      .delete('/api/events/b0000000-0000-0000-0000-000000000001')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(204);
  });

  test('404 — événement inexistant', async () => {
    prisma.event.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .delete('/api/events/f0000000-0000-0000-0000-000000000001')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });
});