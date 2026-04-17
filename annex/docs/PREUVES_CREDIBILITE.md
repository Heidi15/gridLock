# Preuves de Crédibilité Professionnalisante

Ce document assemble les éléments prouvant que le projet GridLock suit une démarche proche de l'entreprise, valorisant méthode et rigueur autant que le résultat technique.

## 1. Produit (US1-US7)
- **Problème et valeur** : Défini dans BACKLOG - UTILISATION DE L'IA.txt (US01)
- **Personas et scénarios** : Implicites dans les comptes de démo (README.md)
- **Landing page** : annex/GridLock_LandingPage.html
- **Maquettes** : annex/GridLock_Maquettes_US08.html
- **MVP** : Fonctionnel avec parcours complet (login → dashboard → événements → participations)

## 2. Architecture (US10-US15)
- **Architecture globale** : Implicite dans docker-compose.yml et structure dossiers
- **Choix techniques** : Justifiés dans README.md (stack table)
- **Diagrammes** : Non produits (limite étudiante), mais API documentée implicitement dans routes/
- **Modèle de données** : prisma/schema.prisma
- **Rôles et permissions** : middleware/role.middleware.js, middleware/auth.middleware.js
- **Contrat API** : routes/*.js avec commentaires

## 3. Qualité (US27-US31)
- **Règles qualité** : Implicites dans ESLint configs, tests présents
- **Tests unitaires** : backend/__tests__/, frontend/__tests__/
- **Tests intégration** : backend/__tests__/participation.controller.test.js
- **CI/CD** : .github/workflows/ci.yml (lint, tests, build, audit, SBOM, SonarQube)
- **SonarQube** : Étape ajoutée dans CI (nécessite config SonarCloud)

## 4. Sécurité (US32-US33)
- **Analyse sécurité** : npm audit dans CI, validation Zod, JWT, bcrypt
- **Dépendances contrôlées** : SBOM généré dans CI
- **Limites** : Pas de secrets en dur, mais sécurité basique (reconnu dans arbitrages)

## 5. DevOps (US34-US36)
- **Conteneurisation** : backend/Dockerfile, frontend/Dockerfile
- **Orchestration** : docker-compose.yml
- **Documentation** : README.md complet (installation, exploitation, comptes démo)

## 6. Gouvernance IA (US18-US21)
- **Configuration Antigravity** : antigravity.config.md
- **Règles agents** : Implicites dans config (pas de modifications hors périmètre)
- **Garde-fous** : CI bloque sur échecs, pas de secrets exposés

## 7. Git et Méthode (US16-US17)
- **Stratégie Git** : Branches main/develop, commits atomiques
- **Convention commits** : Implicite (feat:, fix:, etc.)
- **Journal décisions** : CHANGELOG_IMPLEMENTATION.md, ARBITRAGES.md

## 8. Livraison et Soutenance (US37-US39)
- **Version démontrable** : Release workflow (.github/workflows/release.yml)
- **Arbitrages justifiés** : ARBITRAGES.md
- **Preuves assemblées** : Ce document

## Limites Reconnues
- Pas de tests E2E complets (Playwright)
- Sécurité non hardening production
- Pas de monitoring/analytics
- Diagrammes manquants (sequence, classe)
- SonarQube nécessite config manuelle

Ces éléments démontrent une approche structurée : du backlog à la livraison, avec qualité, sécurité et DevOps intégrés, malgré les contraintes étudiantes.