require('../test/setup');
const requireRole = require('../middleware/role.middleware');

describe('requireRole middleware', () => {
  let res, next;

  beforeEach(() => {
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  test('appelle next() si le rôle est autorisé', () => {
    const req = { user: { role: 'admin' } };
    requireRole('admin', 'director')(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('retourne 403 si le rôle n\'est pas autorisé', () => {
    const req = { user: { role: 'student' } };
    requireRole('admin')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('retourne 401 si req.user est absent', () => {
    const req = {};
    requireRole('admin')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
