# GridLock — Configuration Antigravity
# Projet ESIEE-IT — Utilisation de l'IA — Avril 2026
# Référence : US18

## PÉRIMÈTRE
- L'agent ne modifie QUE les fichiers liés à la US en cours de traitement
- Tout changement hors scope (autre US, autre module) est interdit sans validation humaine explicite
- Avant tout changement structurel (nouveau service, nouvelle table, nouveau composant majeur),
  l'agent formule une proposition et attend une validation humaine

## VÉRIFICATIONS OBLIGATOIRES AVANT COMMIT
- [ ] Les tests unitaires et d'intégration passent (npm test dans backend/ et frontend/)
- [ ] ESLint / Prettier ne remonte aucune erreur bloquante
- [ ] Aucun secret (mot de passe, clé API) n'est présent dans le code
- [ ] La documentation concernée par la US est mise à jour
- [ ] Le commit suit la convention définie (US17)

## RÈGLES GIT
- Aucun push direct sur main ou develop
- Chaque livraison = une branche feature/{us-id}-{description}
- Commits atomiques : 1 sujet = 1 commit
- Format : <type>(<scope>): <description>
- Exemples valides :
    feat(participation): add student registration to event
    fix(auth): handle expired token redirect
    test(participation): add unit test for duplicate check
    chore(docker): add compose file for local dev

## SÉCURITÉ
- Aucun secret hardcodé — utiliser process.env + .env.example
- Prisma protège des injections SQL — ne pas contourner avec des requêtes brutes non validées
- Les mots de passe sont hashés avec bcrypt (min 12 rounds) — jamais en clair
- Le rôle de l'utilisateur est vérifié côté API (role.middleware.js), jamais seulement côté frontend

## TRAÇABILITÉ
- Toute décision structurante est ajoutée au journal des décisions (US15)
- Les modifications d'architecture nécessitent une mise à jour du schéma Prisma ET du document US12
- Tout ajout de dépendance doit être justifié dans le commit

## COMPORTEMENT ATTENDU DE L'AGENT (US19)
- L'agent explicite ses hypothèses avant de coder
- L'agent annonce les fichiers qu'il va modifier avant d'agir
- L'agent signale les points incertains plutôt que de deviner en silence
- L'agent refuse les demandes qui changeraient le périmètre, la sécurité ou l'architecture
  sans validation humaine

## RÈGLES PAR TYPE DE PRODUCTION (US19)
- Génération de code    : suivre ESLint, Prettier, conventions de nommage. Pas de console.log en prod.
- Documentation        : mise à jour du fichier concerné uniquement. Pas de refonte globale non demandée.
- Refactoring          : zéro changement de comportement. Tests avant et après identiques. PR dédiée.
- Tests                : couvrir le cas nominal ET au moins un cas d'erreur. Mocks BDD en tests unitaires.
- Validation           : l'agent ne valide pas lui-même son propre code — il signale ce qui reste à vérifier.

## QUALITÉ (US20)
- SonarQube : pas de code dupliqué, complexité cyclomatique < 10, pas de code mort
- Toute route API générée doit avoir un middleware d'authentification et de vérification du rôle
- Tout ajout de règle métier = test associé dans le même commit ou justification documentée
- L'agent signale tout risque de régression avant de modifier du code existant
- L'agent documente explicitement les raccourcis pris : // TODO(#US-XX): à compléter
