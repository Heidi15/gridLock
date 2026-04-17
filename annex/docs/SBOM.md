# GridLock — SBOM (Software Bill of Materials)

**US33 — Inventaire des composants logiciels tiers**
**ESIEE-IT — Projet IA — Avril 2026**

---

## Procédure de génération

La SBOM peut être régénérée automatiquement avec `cyclonedx-npm` :

```bash
# Installation de l'outil (une seule fois)
npm install -g @cyclonedx/cyclonedx-npm

# Génération SBOM format JSON (CycloneDX v1.4)
cd backend  && cyclonedx-npm --output-format JSON --output-file ../docs/sbom-backend.json
cd frontend && cyclonedx-npm --output-format JSON --output-file ../docs/sbom-frontend.json
```

Pour vérifier les vulnérabilités connues avec `npm audit` :

```bash
cd backend  && npm audit --audit-level=moderate
cd frontend && npm audit --audit-level=moderate
```

---

## Backend — Dépendances de production

| Package            | Version | Rôle                          | Justification                                         |
| ------------------ | ------- | ------------------------------ | ----------------------------------------------------- |
| `@prisma/client` | ^5.10.0 | ORM PostgreSQL                 | Abstraction BDD, requêtes typées, migrations (US10) |
| `bcryptjs`       | ^2.4.3  | Hachage mots de passe          | bcrypt 12 rounds — conforme US20 / US33              |
| `cors`           | ^2.8.5  | Middleware CORS Express        | Autorisation des requêtes cross-origin frontend→API |
| `dotenv`         | ^16.4.1 | Variables d'environnement      | Chargement `.env` — jamais de secrets hardcodés   |
| `express`        | ^4.18.2 | Framework HTTP                 | Routage, middlewares, gestion requêtes/réponses     |
| `jsonwebtoken`   | ^9.0.2  | Génération/vérification JWT | Authentification stateless (US09)                     |
| `zod`            | ^3.22.4 | Validation des schémas        | Validation entrées API avant traitement (US13)       |

**Total production : 7 dépendances**

---

## Backend — Dépendances de développement

| Package        | Version | Rôle                             | Justification                                  |
| -------------- | ------- | --------------------------------- | ---------------------------------------------- |
| `prisma`     | ^5.10.0 | CLI Prisma (migrations, generate) | Gestion schéma BDD et migrations              |
| `jest`       | ^29.7.0 | Framework de tests                | Tests unitaires et d'intégration (US29/US30)  |
| `supertest`  | ^6.3.4  | Tests HTTP                        | Tests d'intégration des routes Express (US30) |
| `nodemon`    | ^3.0.3  | Hot reload dev                    | Rechargement automatique en développement     |
| `eslint`     | ^8.57.0 | Linter JavaScript                 | Qualité de code statique (US28)               |
| `@eslint/js` | ^9.0.0  | Config ESLint moderne             | Règles ESLint recommandées                   |

**Total dev : 6 dépendances**

---

## Frontend — Dépendances de production

| Package              | Version | Rôle                 | Justification                            |
| -------------------- | ------- | --------------------- | ---------------------------------------- |
| `react`            | ^18.2.0 | Framework UI          | Rendu composants, gestion état (US10)   |
| `react-dom`        | ^18.2.0 | Rendu DOM React       | Montage de l'app dans le navigateur      |
| `react-router-dom` | ^6.22.1 | Routage côté client | Navigation SPA, routes protégées       |
| `axios`            | ^1.6.7  | Client HTTP           | Appels API avec intercepteurs JWT (US26) |

**Total production : 4 dépendances**

---

## Frontend — Dépendances de développement

| Package                         | Version  | Rôle                       | Justification                              |
| ------------------------------- | -------- | --------------------------- | ------------------------------------------ |
| `vite`                        | ^5.1.3   | Build tool / dev server     | Compilation rapide, HMR (US10)             |
| `@vitejs/plugin-react`        | ^4.2.1   | Plugin React pour Vite      | Support JSX + Fast Refresh                 |
| `tailwindcss`                 | ^3.4.1   | Framework CSS utility-first | Cohérence visuelle, tokens couleur (US08) |
| `postcss`                     | ^8.4.35  | Transformations CSS         | Pipeline Tailwind                          |
| `autoprefixer`                | ^10.4.17 | Préfixes CSS               | Compatibilité navigateurs                 |
| `vitest`                      | ^1.3.1   | Framework de tests          | Tests unitaires frontend (US29)            |
| `@testing-library/react`      | ^14.2.1  | Tests composants React      | Rendu + interactions composants            |
| `@testing-library/jest-dom`   | ^6.4.2   | Matchers DOM                | Assertions accessibilité/DOM              |
| `@testing-library/user-event` | ^14.5.2  | Simulation interactions     | Simulation clavier/souris dans tests       |
| `jsdom`                       | ^24.0.0  | DOM virtuel pour tests      | Environnement navigateur simulé (Vitest)  |
| `eslint`                      | ^8.57.0  | Linter JS/JSX               | Qualité de code frontend                  |
| `eslint-plugin-react`         | ^7.33.2  | Règles ESLint React        | Bonnes pratiques React                     |
| `eslint-plugin-react-hooks`   | ^4.6.0   | Règles React Hooks         | Détection mauvais usage des hooks         |

**Total dev : 13 dépendances**

---

## Infrastructure Docker

| Image        | Version   | Rôle                               |
| ------------ | --------- | ----------------------------------- |
| `node`     | 20-alpine | Runtime Node.js backend et frontend |
| `postgres` | 15-alpine | Base de données relationnelle      |

---

## Analyse des risques de dépendances

### Dépendances à surveiller

| Package            | Risque | Raison                                                                       | Action                                    |
| ------------------ | ------ | ---------------------------------------------------------------------------- | ----------------------------------------- |
| `jsonwebtoken`   | Moyen  | Bibliothèque d'auth critique — toute vulnérabilité impacte la sécurité | Surveiller CVE, mettre à jour rapidement |
| `bcryptjs`       | Faible | Bibliothèque mature et stable, peu de mises à jour                         | Vérifier à chaque audit                 |
| `express`        | Faible | Framework très utilisé, patch rapides                                      | Suivre les releases de sécurité         |
| `@prisma/client` | Faible | Prisma publie des correctifs réguliers                                      | Mettre à jour avec chaque minor          |

### Dépendances retirées (justification)

Aucune dépendance installée n'a été retirée — chaque package est justifié ci-dessus.

Les packages suivants ont été **volontairement non ajoutés** :

- `passport` / `passport-jwt` — remplacé par implémentation JWT directe (plus légère pour MVP)
- `helmet` — non ajouté (pas de déploiement public dans le MVP — à ajouter en V2)
- `express-rate-limit` — hors MVP, documenté comme limite de sécurité connue (US33)
- `morgan` — logger HTTP non nécessaire en MVP (console.error suffit)

---

## Procédure d'audit de vulnérabilités

À exécuter avant chaque déploiement ou merge sur `main` :

```bash
# Audit backend
cd backend
npm audit --audit-level=moderate
# En cas de vulnérabilité : npm audit fix

# Audit frontend
cd frontend
npm audit --audit-level=moderate
# En cas de vulnérabilité : npm audit fix

# Vérification des licences (outil optionnel)
npx license-checker --onlyAllow "MIT;ISC;BSD-2-Clause;BSD-3-Clause;Apache-2.0"
```

---

## Conformité des licences

| Licence    | Packages concernés                                                                                       | Compatible usage éducatif |
| ---------- | --------------------------------------------------------------------------------------------------------- | -------------------------- |
| MIT        | express, axios, react, zod, jest, vitest, tailwindcss, nodemon, dotenv, cors, supertest, eslint, bcryptjs | ✅ Oui                     |
| Apache-2.0 | @prisma/client, prisma                                                                                    | ✅ Oui                     |
| ISC        | jsonwebtoken, jsdom                                                                                       | ✅ Oui                     |

**Aucune dépendance sous licence copyleft (GPL) — utilisation libre pour ce projet éducatif.**

---

*GridLock — SBOM — US33 — ESIEE-IT — Avril 2026*
