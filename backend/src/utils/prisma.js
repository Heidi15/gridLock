const { PrismaClient } = require('@prisma/client');

// Singleton Prisma pour éviter les connexions multiples en dev (hot reload)
const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

module.exports = prisma;
