# GridLock

> Application web de suivi des participations étudiantes aux JPO, Salons et Forums — ESIEE-IT

GridLock remplace un fichier Excel partagé par une interface structurée permettant à l'équipe Sourcing d'ESIEE-IT de gérer les événements, inscrire les étudiants et consulter des récapitulatifs en temps réel.

---

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | React 18 + Vite + TailwindCSS |
| Backend | Node.js + Express.js |
| ORM | Prisma 5 |
| Base de données | PostgreSQL 15 |
| Auth | JWT (jsonwebtoken) + bcrypt |
| Validation | Zod |
| Tests backend | Jest + Supertest |
| Tests frontend | Vitest + Testing Library |
| Conteneurisation | Docker + Docker Compose |
| CI/CD | GitHub Actions |

---

## Démarrage rapide

### Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installé et démarré
- Node.js 20+ (pour le développement local sans Docker)

### Lancement avec Docker Compose (recommandé)

```bash
# 1. Cloner le dépôt
git clone <url-du-repo>
cd gridlock

# 2. Copier les variables d'environnement
cp .env.example .env

# 3. Démarrer tous les services
docker compose up --build

# 4. (Premier lancement) Appliquer les migrations et charger les données de démo
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npm run prisma:seed
```

L'application est accessible sur :
- **Frontend** : http://localhost:3000
- **API** : http://localhost:4000/api
- **Health check** : http://localhost:4000/api/health

### Lancement en développement local (sans Docker)

```bash
# Démarrer uniquement PostgreSQL via Docker
docker compose up db -d

# Backend
cd backend
cp .env.example .env        # éditer DATABASE_URL si besoin
npm install
npx prisma migrate dev
npm run prisma:seed
npm run dev                 # http://localhost:4000

# Frontend (autre terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev                 # http://localhost:3000
```

---

## Comptes de démonstration

| Email | Mot de passe | Rôle | Accès |
|---|---|---|---|
| `sophie@esiee-it.fr` | `Admin123!` | Admin | Toutes les fonctionnalités |
| `marc@esiee-it.fr` | `Director1!` | Director | Lecture + dashboard |
| `enzo.martin@edu.esiee-it.fr` | `Student1!` | Student | Ses participations uniquement |

---

## Structure du projet

```
gridlock/
├── .github/workflows/      # CI GitHub Actions
├── frontend/               # Application React + Vite
│   ├── src/
│   │   ├── components/     # Button, Badge, Modal, Sidebar, Toast…
│   │   ├── context/        # AuthContext, ToastContext
│   │   ├── pages/          # Dashboard, Events, EventDetail, Students…
│   │   ├── services/       # api.js (Axios), auth.service.js
│   │   └── utils/          # helpers (formatDate, couleurs badges)
│   └── Dockerfile
├── backend/                # API REST Node.js + Express
│   ├── prisma/
│   │   ├── schema.prisma   # Modèle de données (User, Student, Event, Participation)
│   │   └── seed.js         # Données de démo
│   ├── src/
│   │   ├── controllers/    # auth, events, students, participations, dashboard
│   │   ├── middleware/     # auth (JWT), role, validate (Zod), error
│   │   ├── routes/         # auth, events, students, participations, dashboard
│   │   ├── utils/          # jwt.utils.js, prisma.js (singleton)
│   │   └── validators/     # schemas.js (Zod)
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
├── antigravity.config.md   # Règles pour les agents IA
└── README.md
```

---

## Commandes utiles

### Backend

```bash
cd backend

npm run dev              # Démarrer en mode développement (nodemon)
npm test                 # Lancer les tests Jest
npm run test:coverage    # Tests avec rapport de couverture
npm run lint             # ESLint
npm run prisma:seed      # Charger les données de démo
npm run prisma:reset     # Réinitialiser la BDD et re-seeder
```

### Frontend

```bash
cd frontend

npm run dev              # Démarrer Vite dev server
npm test                 # Lancer les tests Vitest
npm run build            # Build de production
npm run lint             # ESLint
```

### Docker

```bash
docker compose up --build          # Démarrer tous les services
docker compose up -d               # Démarrer en arrière-plan
docker compose logs backend -f     # Suivre les logs du backend
docker compose exec backend sh     # Shell dans le container backend
docker compose down -v             # Arrêter et supprimer les volumes
```

---

## API — Routes principales

Toutes les routes (sauf `/api/auth/login`) requièrent le header :
```
Authorization: Bearer <jwt_token>
```

| Méthode | Route | Rôle requis | Description |
|---|---|---|---|
| POST | `/api/auth/login` | — | Authentification |
| GET | `/api/dashboard` | admin, director | KPIs globaux |
| GET | `/api/events` | admin, director | Liste des événements |
| POST | `/api/events` | admin | Créer un événement |
| GET | `/api/events/:id` | admin, director | Détail + participants |
| PUT | `/api/events/:id` | admin | Modifier un événement |
| DELETE | `/api/events/:id` | admin | Supprimer un événement |
| POST | `/api/events/:id/participations` | admin | Inscrire un étudiant |
| PUT | `/api/participations/:id` | admin | Modifier statut / ambassadeur |
| DELETE | `/api/participations/:id` | admin | Supprimer un participant |
| GET | `/api/students?q=` | admin, director | Auto-complétion (min 2 chars) |
| GET | `/api/students/:id/participations` | admin, director | Récap étudiant |
| GET | `/api/students/me/participations` | student | Mes participations |

---

## Modèle de données

```
User ──────────── Student
  │                  │
  │ crée             │ participe via
  ▼                  ▼
Event ────────── Participation
```

- **User** : compte d'accès (admin / director / student), lié optionnellement à un Student
- **Student** : apprenant ESIEE-IT (importé depuis la base apprenants)
- **Event** : JPO, Salon, Forum ou Évènement
- **Participation** : lien Event ↔ Student avec statut (confirmé/présent/absent) et flag ambassadeur

Contrainte d'unicité : un étudiant ne peut être inscrit qu'une fois par événement.

---

## Tests

```bash
# Backend — Jest
cd backend && npm test

# Frontend — Vitest
cd frontend && npm test
```

Les tests couvrent :
- Middleware JWT (token absent, expiré, invalide, valide)
- Middleware de rôle (autorisé, refusé, non authentifié)
- Controller participation (cas nominal 201, doublon 409, événement/étudiant introuvable 404, erreur serveur)
- Helpers frontend (formatDate, statutColor, statutLabel, typeColor, getErrorMessage)
- Composants Badge (StatutBadge, TypeBadge, AmbassadeurBadge)

---

## CI/CD

Le pipeline GitHub Actions (`.github/workflows/ci.yml`) se déclenche sur chaque push et PR vers `main` ou `develop` :

1. **Backend** : `npm ci` → `prisma generate` → `eslint` → `jest --coverage`
2. **Frontend** : `npm ci` → `eslint` → `vitest` → `vite build`
3. **Docker** : `docker compose build` → vérification que les containers démarrent

---

## Règles de contribution

Ce projet suit les conventions définies dans les US16/17/18 :

- **Branches** : `feature/{us-id}-{description}`, `fix/{description}`, `chore/{description}`
- **Commits** : `<type>(<scope>): <description>` — format conventionnel strict
- **PRs** : obligatoires vers `develop` et `main`, avec review documentée
- **Agents IA** : voir `antigravity.config.md` pour les règles applicables

---

## Périmètre MVP

Inclus dans ce MVP :
- CRUD événements (JPO, Salon, Forum, Évènement)
- Inscription étudiants avec auto-complétion et vérification doublon
- Gestion des statuts (confirmé / présent / absent) et flag ambassadeur
- Récapitulatifs par événement et par étudiant
- Dashboard KPIs (admin/director)
- Authentification JWT avec gestion des rôles (admin / director / student)
- Interface responsive avec guide UI cohérent

Hors périmètre MVP (V2) :
- Envoi d'emails de confirmation
- Import CSV automatique
- Mode sombre
- Export PDF / statistiques avancées
- Intégration SSO

---

*GridLock — ESIEE-IT — Projet IA — Avril 2026*
