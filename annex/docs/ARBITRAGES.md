# Arbitrages, Compromis et Priorités du Backlog

## Contexte

Le projet GridLock a été développé dans un cadre étudiant avec des contraintes de temps (sprint d'une semaine) et de ressources. Les priorités ont été définies pour livrer un MVP fonctionnel démontrant la valeur principale : remplacer un Excel partagé par une application web structurée pour la gestion des participations étudiantes aux événements.

## Arbitrages Majeurs

### 1. Périmètre MVP vs Fonctionnalités Avancées

- **Décision** : Focus sur le cœur métier (CRUD événements, étudiants, participations) plutôt que sur des features secondaires comme notifications push ou intégration calendrier.
- **Bénéfice** : Livraison d'un produit cohérent et testable en temps limité.
- **Coût** : Certaines fonctionnalités intéressantes (ex: export PDF, recherche avancée) reportées post-MVP.

### 2. Stack Technique Simplifiée

- **Décision** : Choix de Node.js/Express pour le backend malgré une préférence potentielle pour Python/Django, pour uniformiser la stack JS full-stack.
- **Bénéfice** : Réduction de la complexité d'apprentissage et de déploiement.
- **Coût** : Moins de robustesse côté backend comparé à des frameworks matures comme Django.

### 3. Sécurité Minimale vs Sécurité Complète

- **Décision** : Implémentation basique (JWT, bcrypt, validation Zod) sans OAuth ou 2FA.
- **Bénéfice** : Focus sur la fonctionnalité plutôt que sur la sécurité avancée.
- **Coût** : Vulnérabilités potentielles en production ; nécessite hardening post-MVP.

### 4. Tests Unitaires Prioritaires

- **Décision** : Tests unitaires et d'intégration pour le backend, tests de composants pour le frontend, pas de tests E2E complets.
- **Bénéfice** : Bonne couverture des règles métier critiques.
- **Coût** : Risque de bugs d'intégration non détectés.

### 5. Conteneurisation vs Déploiement Traditionnel

- **Décision** : Docker obligatoire pour faciliter la démonstration et le déploiement.
- **Bénéfice** : Environnement reproductible pour jury et développement.
- **Coût** : Overhead de configuration Docker pour un petit projet.

## Compromis Accepter

### Délai vs Qualité

- Accepté un code "suffisant" plutôt que "parfait" pour respecter les deadlines.
- Résultat : Dette technique mineure (refactoring possible post-projet).

### Périmètre vs Exhaustivité

- Certaines US (ex: US31 SonarQube complet, US32 analyse sécurité approfondie) implémentées de manière basique.
- Résultat : Produit démontrable mais non production-ready sans ajustements.

### Ergonomie vs Fonctionnalité

- Interface simple et fonctionnelle plutôt qu'optimisée UX (pas d'A/B testing, analytics).
- Résultat : Bonne utilisabilité de base, améliorable avec feedback utilisateur.

## Priorités du Backlog

### Stories Prioritaires (US1-US29)

- Réalisées en premier car essentielles au MVP : définition produit, architecture, développement cœur, tests, conteneurisation.
- Critère : Valeur métier directe pour le remplacement d'Excel.

### Stories Secondaires (US30-US39)

- Réalisées en fin de projet : CI/CD, qualité avancée, sécurité, documentation, préparation soutenance.
- Critère : Nécessaires pour crédibilité professionnelle mais non bloquantes pour la fonctionnalité de base.

### Stories Non Réalisées

- Aucune US majeure non réalisée ; toutes couvertes au minimum.
- Si temps insuffisant, certaines analyses (SWOT détaillée, benchmark approfondi) simplifiées.

## Justification Finale

Ces arbitrages permettent de livrer un produit crédible démontrant une démarche professionnelle : du besoin à la livraison, en passant par architecture, qualité et DevOps. Le compromis principal est la robustesse production au profit de la démonstration pédagogique.
