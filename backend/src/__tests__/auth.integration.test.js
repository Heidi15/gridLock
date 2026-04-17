/**
 * Tests d'intégration — Authentification (US30)
 * Vérifie les interactions complètes : route → middleware → controller → réponse HTTP
 * Utilise supertest sur l'app Express sans vraie connexion BDD (Prisma mocké).
 */
process.env.JWT_SECRET = 'integration_test_secret';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const bcrypt = require('bcryptjs');

// Mock Prisma avant tout require de l'app
jest.mock('../utils/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    upsert: jest.fn(),
  },
  student: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
  },
  $transaction: jest.fn(),
  $disconnect: jest.fn(),
}));

const app = require('../app');
const prisma = require('../utils/prisma');

// ─── POST /api/auth/login ───────────────────────────────────────────────────
describe('POST /api/auth/login', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 — retourne un token et les infos utilisateur si identifiants valides', async () => {
    const hash = await bcrypt.hash('Admin123!', 12);
    prisma.user.findUnique.mockResolvedValue({
      id: 'uuid-admin',
      email: 'sophie@esiee-it.fr',
      passwordHash: hash,
      role: 'admin',
      studentId: null,
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'sophie@esiee-it.fr', password: 'Admin123!' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toMatchObject({ email: 'sophie@esiee-it.fr', role: 'admin' });
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });

  test('401 — identifiants invalides (mauvais mot de passe)', async () => {
    const hash = await bcrypt.hash('CorrectPassword1!', 12);
    prisma.user.findUnique.mockResolvedValue({
      id: 'uuid-admin',
      email: 'sophie@esiee-it.fr',
      passwordHash: hash,
      role: 'admin',
      studentId: null,
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'sophie@esiee-it.fr', password: 'WrongPassword1!' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  test('401 — utilisateur inexistant', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'inconnu@esiee-it.fr', password: 'Admin123!' });

    expect(res.status).toBe(401);
  });

  test('400 — corps manquant (email absent)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'Admin123!' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('details');
  });

  test('400 — format email invalide', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'not-an-email', password: 'Admin123!' });

    expect(res.status).toBe(400);
  });
});

// ─── POST /api/auth/register ────────────────────────────────────────────────
describe('POST /api/auth/register', () => {
  beforeEach(() => jest.clearAllMocks());

  test('201 — crée le compte et retourne un token', async () => {
    const newUser = {
      id: 'uuid-new',
      email: 'test.user@edu.esiee-it.fr',
      role: 'student',
      studentId: 'student-uuid',
    };

    prisma.user.findUnique.mockResolvedValue(null); // pas de doublon
    prisma.$transaction.mockImplementation(async (fn) => {
      return fn({
        student: { upsert: jest.fn().mockResolvedValue({ id: 'student-uuid' }) },
        user: { create: jest.fn().mockResolvedValue(newUser) },
      });
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        nom: 'USER',
        prenom: 'Test',
        email: 'test.user@edu.esiee-it.fr',
        password: 'Secure1!',
        formation: 'Informatique', // ← required by registerSchema
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.role).toBe('student');
  });

  test('400 — email hors domaine @edu.esiee-it.fr', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        nom: 'USER',
        prenom: 'Test',
        email: 'test@gmail.com',
        password: 'Secure1!',
        formation: 'Informatique',
      });

    expect(res.status).toBe(400);
  });

  test('400 — mot de passe trop faible (moins de 8 caractères)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        nom: 'USER',
        prenom: 'Test',
        email: 'test.user@edu.esiee-it.fr',
        password: 'abc',
        formation: 'Informatique',
      });

    expect(res.status).toBe(400);
    expect(res.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'password' }),
      ])
    );
  });

  test('409 — email déjà utilisé', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'existing' }); // doublon

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        nom: 'USER',
        prenom: 'Test',
        email: 'enzo.martin@edu.esiee-it.fr',
        password: 'Secure1!',
        formation: 'Informatique', // ← required so schema passes, duplicate check runs
      });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/existe déjà/);
  });
});

// ─── GET /api/health ────────────────────────────────────────────────────────
describe('GET /api/health', () => {
  test('200 — retourne le statut OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});