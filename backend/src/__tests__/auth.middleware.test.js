require('../test/setup');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth.middleware');

process.env.JWT_SECRET = 'test_secret';

describe('authMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  test('retourne 401 si aucun header Authorization', () => {
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('retourne 401 si header sans Bearer', () => {
    req.headers['authorization'] = 'Basic sometoken';
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('retourne 401 si token invalide', () => {
    req.headers['authorization'] = 'Bearer invalidtoken';
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('retourne 401 avec message spécifique si token expiré', () => {
    const expiredToken = jwt.sign(
      { id: 'uuid', email: 'test@test.fr', role: 'admin' },
      'test_secret',
      { expiresIn: '-1s' }
    );
    req.headers['authorization'] = `Bearer ${expiredToken}`;
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('expirée') })
    );
  });

  test('appelle next() et injecte req.user si token valide', () => {
    const token = jwt.sign(
      { id: 'uuid-123', email: 'sophie@esiee-it.fr', role: 'admin' },
      'test_secret',
      { expiresIn: '1h' }
    );
    req.headers['authorization'] = `Bearer ${token}`;
    authMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toMatchObject({ email: 'sophie@esiee-it.fr', role: 'admin' });
  });
});
