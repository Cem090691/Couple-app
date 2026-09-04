# Reconnect

Application mobile (iOS + Android) pour couples : un programme guidé de
6 semaines pour se reconnecter, suivi d'un rituel hebdomadaire continu.

> Nom de travail provisoire, susceptible de changer.

## État du projet

**Étape 1 — Fondations.** Auth Supabase (inscription, connexion, mot de
passe oublié), création/invitation/rejoint de couple, et le moteur
complet du programme (questions individuelles → synthèse par règles →
expérience commune → semaine suivante), y compris le mode continu
"Continuer ensemble" après la 6ᵉ semaine. Contenu des 6 semaines déjà
rédigé et seedé en base.

Pas encore fait : notifications, tests automatisés, icônes/assets de
marque définitifs, build EAS.

## Stack technique

- [Expo](https://expo.dev) (SDK 57) + [Expo Router](https://docs.expo.dev/router/introduction/) + TypeScript
- [Supabase](https://supabase.com) : PostgreSQL, Auth, Row Level Security, Realtime, Edge Functions

## Installation

```bash
npm install
```

## Configuration

### 1. Projet Supabase

Crée un projet sur [supabase.com](https://supabase.com) (le plan gratuit suffit).

Copie `.env.example` en `.env` et renseigne, depuis Project Settings → API :

```bash
cp .env.example .env
```

### 2. Base de données

Avec la [CLI Supabase](https://supabase.com/docs/guides/cli), lie le
projet local au projet distant puis applique les migrations (dans
`supabase/migrations/`, dans l'ordre) :

```bash
supabase link --project-ref <ton-project-ref>
supabase db push
```

Ça crée les tables, les policies RLS, les fonctions (`create_couple_and_invite`,
`join_couple_by_code`, `leave_couple`, `get_week_insights`,
`advance_current_week`), et seed le contenu des 6 semaines + du mode
continu.

### 3. Realtime

`0003_realtime.sql` active déjà les mises à jour en direct sur les
tables nécessaires. Rien à faire de plus si tu es passé par `supabase
db push`.

### 4. Edge Function (suppression de compte)

```bash
supabase functions deploy delete-account
```

## Lancer l'application

```bash
npx expo start
```

Puis ouvre l'app dans [Expo Go](https://expo.dev/go), un simulateur iOS
ou un émulateur Android. Ce n'est pas une web app (voir plus bas) :
`npx expo start --web` fonctionne pour un aperçu rapide, mais l'app est
pensée et testée pour mobile.

## Sécurité & confidentialité

La confidentialité des réponses individuelles est garantie par Row Level
Security, pas par l'interface : un partenaire ne peut jamais lire la
réponse brute de l'autre via une requête API, quelle qu'elle soit (voir
les commentaires en tête de `supabase/migrations/0001_init.sql`). La
seule comparaison possible passe par `get_week_insights`, qui ne renvoie
jamais le contenu d'une réponse qui ne correspond pas à celle du/de la
partenaire.

Quitter un couple (Profil → Quitter le couple) dissout entièrement
l'espace partagé pour les deux membres — un choix volontairement simple,
documenté dans la migration.

## Structure du projet

```
src/
  app/                Écrans et routes (Expo Router)
    onboarding/        Écrans d'accueil (avant inscription)
    (auth)/            Inscription, connexion, mot de passe oublié
    (couple)/          Créer/inviter, rejoindre, attendre son/sa partenaire
    (tabs)/            Accueil, Progression, Profil (+ sous-pages)
    program/           Questions, points communs, expérience, fin de semaine
  components/
    ui/                Boutons, champs, sélecteurs — kit partagé
  lib/
    auth/              AuthProvider (session Supabase)
    couple/             CoupleProvider + actions (créer/rejoindre/quitter)
    program/            Requêtes et état de la semaine en cours
    supabase/            Client, stockage sécurisé de la session, types
supabase/
  migrations/          Schéma, RLS, fonctions, contenu du programme
  functions/
    delete-account/    Edge Function : suppression définitive du compte
```

## Ce qui n'est PAS dans ce MVP (volontairement)

Pas de réseau social, pas de messagerie, pas d'IA, pas de gamification,
pas de visioconférence, pas de paiement. Voir le brief produit pour le
détail — l'idée est une expérience guidée à deux, simple et régulière,
pas une plateforme.
