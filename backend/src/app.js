require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const eventRoutes = require('./routes/events.routes');
const studentRoutes = require('./routes/students.routes');
const participationRoutes = require('./routes/participations.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const errorHandler = require('./middleware/error.middleware');

const app = express();

// ─── Middlewares globaux ────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// ─── Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/participations', participationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Middleware d'erreurs global (doit être en dernier) ────────────────────
app.use(errorHandler);

// ─── Démarrage du serveur ──────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 GridLock API démarrée sur http://localhost:${PORT}`);
    console.log(`   Environnement : ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = app;
