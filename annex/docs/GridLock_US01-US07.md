# GridLock — Document de Cadrage Produit
**ESIEE-IT — Projet IA — Utilisation de l'IA**  
US01 · US02 · US03 · US04 · US05 · US07  
Avril 2026

---

## US01 — Définition du problème, de la cible et de la proposition de valeur

### 1.1 Problème identifié

L'équipe Sourcing d'ESIEE-IT gère aujourd'hui la participation des étudiants aux événements de promotion (JPO, Salons, Forums, Interventions) via un fichier Excel partagé. Ce fichier comporte plusieurs onglets : un onglet principal de saisie des participations, un récapitulatif automatique par étudiant, et une base de référence des apprenants.

**Causes du problème**

- Saisie manuelle fastidieuse : chaque inscription d'un étudiant à un événement nécessite plusieurs champs à remplir manuellement (nom, prénom, formation, contact, confirmation, présence, statut ambassadeur).
- Risque d'erreurs et d'incohérences : les doublons, les fautes de frappe sur les noms et les formules Excel cassées sont fréquents.
- Pas de traçabilité : impossible de voir rapidement qui a participé à quoi, sans ouvrir le tableau croisé dynamique.
- Pas de vue individuelle exploitable : les étudiants eux-mêmes n'ont pas accès à leur récapitulatif de participations.
- Aucune validation des données : n'importe qui peut modifier n'importe quelle cellule, sans contrôle ni historique.

**Impact constaté**

- Perte de temps significative pour le personnel Sourcing à chaque événement.
- Données parfois inexploitables pour les bilans d'engagement étudiant.
- Impossibilité de déléguer la saisie à d'autres personnes sans risque d'altérer la structure du fichier.

### 1.2 Cible principale

| | |
|---|---|
| **Utilisateurs primaires** | L'équipe Sourcing / Engagement d'ESIEE-IT (responsables des JPO, salons et forums) |
| **Utilisateurs secondaires** | Les étudiants ambassadeurs souhaitant consulter leurs participations |
| **Périmètre organisationnel** | ESIEE-IT — Campus Pontoise, Cergy, Paris 15e |
| **Volume estimé** | ~400 étudiants concernés, ~40 événements par an scolaire |

### 1.3 Proposition de valeur

GridLock remplace le tableau Excel par une application web structurée qui permet à l'équipe Sourcing d'ESIEE-IT de :

- Gérer les événements (création, modification, suppression) depuis une interface claire.
- Inscrire et suivre la participation des étudiants à ces événements en quelques clics.
- Consulter en temps réel un récapitulatif par étudiant et par événement.
- Filtrer les données par mois, type d'événement, formation ou statut.

Par rapport à la situation actuelle (Excel), GridLock apporte :

| Gain | Description |
|---|---|
| **Gain de temps** | Saisie guidée, auto-complétion sur les noms d'étudiants depuis la base apprenants |
| **Fiabilité** | Validation des données à la saisie, pas de formule cassée |
| **Traçabilité** | Historique des modifications, données persistées en base |
| **Accessibilité** | Interface web accessible depuis n'importe quel poste, sans Excel |
| **Récap étudiant** | Vue individuelle consultable immédiatement, sans tableau croisé dynamique |

---

## US02 — Personas et scénarios d'usage

### Sophie — Responsable Sourcing / Coordinatrice événements

| | |
|---|---|
| **Objectifs** | Enregistrer rapidement les inscriptions étudiantes avant un événement ; vérifier en un clic qui est confirmé vs. présent après l'événement ; extraire un bilan chiffré par type d'événement pour son reporting mensuel |
| **Frustrations** | Le fichier Excel plante quand plusieurs personnes l'ouvrent en même temps ; les formules du récap se cassent à chaque ajout de ligne ; retrouver un étudiant demande de scroller sur 400 lignes |
| **Scénario prioritaire** | Après le Forum Orientation du 22 novembre, Sophie ouvre l'application, sélectionne l'événement, marque les étudiants présents en cochant leur nom dans la liste, et génère instantanément un récap de présence pour son rapport. |

### Enzo — Étudiant Ambassadeur (Coding Cergy — B3)

| | |
|---|---|
| **Objectifs** | Consulter le nombre d'événements auxquels il a participé cette année ; vérifier si sa participation au prochain salon est bien confirmée |
| **Frustrations** | Il n'a pas accès au fichier Excel (document interne) ; il doit demander par email à Sophie pour avoir son récapitulatif |
| **Scénario prioritaire** | Enzo se connecte à GridLock, accède à son profil étudiant, et voit en un coup d'œil ses 3 participations de l'année avec les dates, lieux et statuts (confirmé / présent / ambassadeur). |

### Marc — Directeur Admissions

| | |
|---|---|
| **Objectifs** | Obtenir le nombre d'étudiants ayant participé à chaque type d'événement ; identifier les formations les plus représentées dans les salons |
| **Frustrations** | Le fichier Excel n'est pas partagé avec lui, il doit demander un export ; les données ne sont pas filtrables facilement par type d'événement et formation |
| **Scénario prioritaire** | Marc accède au tableau de bord de GridLock, filtre par type 'Salon' et par mois 'Octobre', et voit immédiatement le nombre de participations et les formations représentées, sans intervention de l'équipe Sourcing. |

---

## US03 — User Journeys prioritaires

### Journey 1 : Sophie inscrit un étudiant à un événement

| | |
|---|---|
| **Persona** | Sophie — Responsable Sourcing |
| **Déclencheur** | Un étudiant contacte Sophie pour participer à un salon |
| **Résultat attendu** | L'inscription est enregistrée, l'étudiant reçoit une confirmation |

| # | Étape | Action utilisateur | Système | Irritants / Risques |
|---|---|---|---|---|
| 1 | Connexion | Sophie ouvre l'app et s'authentifie | Accès accordé au rôle Admin | Mot de passe oublié → lien de réinitialisation |
| 2 | Sélection événement | Sophie navigue vers l'événement concerné ou en crée un nouveau | Affiche la liste des événements filtrables | Doublon si l'événement existe déjà → validation |
| 3 | Recherche étudiant | Sophie tape le nom de l'étudiant dans le champ de recherche | Auto-complétion depuis la base apprenants | Étudiant introuvable → saisie manuelle possible |
| 4 | Inscription | Sophie valide l'inscription avec le statut 'Confirmé' | Inscription créée, statut = Confirmé | — |
| 5 | Post-événement | Sophie marque l'étudiant 'Présent' et coche 'Ambassadeur' si applicable | Mise à jour du statut en base | Oubli de mettre à jour → rappel ou champ date |
| 6 | Récap | Sophie consulte le bilan de l'événement | Affiche nb inscrits / nb présents / ambassadeurs | — |

### Journey 2 : Enzo consulte son récapitulatif de participations

| | |
|---|---|
| **Persona** | Enzo — Étudiant Ambassadeur |
| **Déclencheur** | Enzo veut savoir combien d'événements il a fait cette année |
| **Résultat attendu** | Il voit son historique complet et les détails de chaque participation |

| # | Étape | Action utilisateur | Système | Irritants / Risques |
|---|---|---|---|---|
| 1 | Connexion | Enzo accède à l'app depuis son navigateur et s'authentifie (email école) | Authentification SSO ou email+mdp | Compte inexistant → demande à Sophie |
| 2 | Accueil | L'app affiche directement son profil et le compteur de participations | Dashboard étudiant personnalisé | Si 0 participation → état vide explicatif |
| 3 | Détail | Enzo clique sur un événement pour voir les détails (date, lieu, statut) | Fiche événement avec son statut personnel | — |
| 4 | Filtrage | Enzo filtre par type (Salon) pour comparer ses contributions | Liste filtrée par catégorie | — |

---

## US04 — MVP, hors périmètre et critères de coupe

### 4.1 Périmètre MVP

Le MVP (Minimum Viable Product) comprend uniquement les fonctionnalités indispensables au parcours principal : gérer des événements et suivre les participations étudiantes.

| Fonctionnalité MVP | Justification |
|---|---|
| CRUD Événements (JPO, Salon, Forum, Évènement) | Fonctionnalité de base : sans événement, rien n'existe |
| Inscription d'un étudiant à un événement | Cœur de l'US principale de Sophie |
| Gestion des statuts : Confirmé / Présent / Ambassadeur | Remplace les colonnes clés du fichier Excel |
| Auto-complétion sur les noms d'étudiants (base apprenants) | Réduit les erreurs de saisie, la valeur clé vs Excel |
| Récapitulatif par événement (nb inscrits, nb présents) | Besoin de Sophie pour son reporting |
| Récapitulatif par étudiant (liste de ses participations) | Remplace l'onglet 'Récap par étudiant' de l'Excel |
| Filtres : par mois, type d'événement, formation | Fonctionnalité différenciante vs. Excel brut |
| Authentification basique (admin / étudiant) | Nécessaire pour séparer les droits d'accès |

### 4.2 Hors périmètre (volontairement écarté)

| Hors périmètre | Justification |
|---|---|
| Envoi d'emails de confirmation automatique | Intégration SMTP hors MVP, complexité technique élevée |
| Application mobile native | Hors contraintes temps, la version web responsive suffit |
| Intégration SSO avec le SI de l'école | Dépendance externe non maîtrisée pour un projet étudiant |
| Import automatique depuis l'Excel existant | Migration des données = risque élevé, documentée séparément |
| Statistiques avancées (graphiques, export PDF) | Valeur secondaire, à envisager en V2 |
| Gestion des établissements partenaires | Donnée présente dans l'Excel mais non prioritaire pour le MVP |

### 4.3 Critères de coupe (en cas de retard)

Si le temps vient à manquer, les fonctionnalités suivantes seront coupées dans cet ordre :

1. Vue récapitulatif étudiant (la vue admin seule suffit à démontrer le MVP)
2. Filtres avancés (date, formation) → garder uniquement le filtre type d'événement
3. Authentification étudiant → garder uniquement l'accès admin pour la démo
4. Auto-complétion → saisie manuelle du nom suffit fonctionnellement

Dans tous les cas, le MVP reste démontrable tant que le parcours *'Sophie inscrit un étudiant à un événement'* est fonctionnel de bout en bout.

---

## US05 — Elevator Pitch

### Version orale (~40 secondes)

> Aujourd'hui, l'équipe Sourcing d'ESIEE-IT suit la participation de ses étudiants aux JPO, salons et forums dans un fichier Excel. C'est chronophage, source d'erreurs, et les étudiants eux-mêmes n'ont aucune visibilité sur leurs propres contributions.
>
> GridLock est une application web qui remplace ce tableur par une interface intuitive : les coordinateurs inscrivent les étudiants en quelques clics, suivent leur présence et leur statut ambassadeur, et consultent des récapitulatifs instantanés par événement ou par étudiant.
>
> Résultat : moins d'erreurs, moins de temps perdu, et une donnée fiable pour piloter l'engagement étudiant.

| | |
|---|---|
| **Cible** | Équipe Sourcing / Engagement d'ESIEE-IT |
| **Problème** | Suivi des participations étudiantes aux événements via Excel : erreurs, perte de temps, aucune visibilité étudiante |
| **Solution** | Application web GridLock : CRUD événements, inscription étudiants, statuts, récapitulatifs |
| **Bénéfice principal** | Données fiables, saisie rapide, vue individuelle pour chaque étudiant |

---

## US07 — SWOT et Benchmark

### 7.1 Analyse SWOT

|  | **Positif** | **Négatif** |
|---|---|---|
| **Interne** | **FORCES** — Connaissance parfaite du besoin métier (données Excel existantes) ; données réelles disponibles pour alimenter et tester l'app ; périmètre fonctionnel limité et ciblé = MVP réaliste ; valeur immédiate pour l'équipe sourcing | **FAIBLESSES** — Projet étudiant : ressources et temps limités ; pas d'équipe dédiée à la maintenance post-projet ; dépendance aux données Excel pour la migration initiale ; accessibilité mobile non prioritaire dans le MVP |
| **Externe** | **OPPORTUNITÉS** — Remplacement d'un processus manuel chronophage ; modèle duplicable pour d'autres suivis éducatifs ; possible intégration future avec les SI de l'école ; valorisation de la démarche professionnalisante pour la soutenance | **MENACES** — Résistance au changement des équipes habituées à Excel ; risque de perte de données lors de la migration ; périmètre qui peut déraper (feature creep) ; maintenance non assurée après le projet étudiant |

### 7.2 Benchmark — Approches alternatives

| Solution | Description | Limites pour notre cas | Décision |
|---|---|---|---|
| Excel / Google Sheets | Solution actuelle. Tableau partagé, récap par tableau croisé dynamique. | Fragile, pas de validation, aucun rôle utilisateur, formules cassées régulièrement. | Remplacé par GridLock |
| Airtable | Base de données no-code avec vues, formulaires et automatisations. | Coût mensuel (plan payant pour équipe), données hébergées hors école, dépendance externe. | Écarté : coût + souveraineté données |
| Notion Database | Outil collaboratif avec vues type base de données. | Peu adapté à un usage structuré avec rôles, pas de validation de données typée. | Écarté : manque de structure métier |
| CRM générique (HubSpot Free) | Gestion contacts et activités, exportable. | Surdimensionné, jargon CRM inadapté au contexte éducatif, courbe d'apprentissage. | Écarté : inadapté au domaine |

### 7.3 Décisions de backlog issues du benchmark

- **Décision #1 — Architecture propre avec rôles** : contrairement à Excel et Notion, GridLock implémente deux rôles distincts (admin / étudiant) avec des vues et permissions différentes. Décision issue du constat qu'aucune solution no-code n'offrait ce niveau de contrôle sans coût.
- **Décision #2 — Validation des données en saisie** : l'absence de validation est la principale faiblesse d'Excel. GridLock impose des champs obligatoires et une sélection depuis une liste apprenants, directement décidé après observation des erreurs dans le fichier réel.
- **Décision #3 — Hébergement local / containerisé** : pour contourner les limitations de souveraineté des données d'Airtable, l'application est conçue pour être déployée dans l'infrastructure de l'école (Docker Compose), sans dépendance cloud externe.
