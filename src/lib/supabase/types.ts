// Types minimaux, écrits à la main, pour les tables/fonctions utilisées
// par l'app. Pas de génération automatique en place pour le MVP (pas de
// projet Supabase de référence lié au dépôt) — à remplacer plus tard par
// `supabase gen types typescript` une fois le projet créé.

export type QuestionKind = 'scale' | 'text' | 'choice';

export type ChoiceOption = { value: string; label: string };

export type Profile = {
  id: string;
  first_name: string | null;
  created_at: string;
};

export type Couple = {
  id: string;
  active_track_id: string;
  active_week_number: number;
  program_completed_at: string | null;
  created_at: string;
};

export type CoupleMember = {
  couple_id: string;
  user_id: string;
  joined_at: string;
};

export type CoupleInvitation = {
  id: string;
  couple_id: string;
  code: string;
  created_by: string | null;
  created_at: string;
  expires_at: string;
  used_at: string | null;
  used_by: string | null;
};

export type ProgramWeek = {
  id: string;
  track_id: string;
  week_number: number;
  title: string;
  objective: string | null;
  experience_title: string | null;
  experience_instructions: string | null;
  created_at: string;
};

export type Question = {
  id: string;
  week_id: string;
  position: number;
  prompt: string;
  kind: QuestionKind;
  options: ChoiceOption[] | null;
  created_at: string;
};

export type AnswerValue = { scale: number } | { choice: string } | { text: string };

export type Answer = {
  id: string;
  question_id: string;
  user_id: string;
  couple_id: string;
  value: AnswerValue;
  created_at: string;
  updated_at: string;
};

export type WeeklyProgress = {
  id: string;
  couple_id: string;
  week_id: string;
  user_id: string;
  questions_completed_at: string | null;
  experience_completed_at: string | null;
  created_at: string;
};

export type WeekInsight = {
  question_id: string;
  kind: QuestionKind;
  both_answered: boolean;
  match?: boolean | null;
  shared_value?: string | null;
};

// NB : on n'utilise volontairement pas le paramètre générique `Database`
// de `createClient<Database>()`. Le modéliser correctement demanderait
// de reproduire toute la mécanique de types interne de postgrest-js
// (Relationships, Views, etc.) pour un bénéfice marginal sur un MVP —
// la sécurité de type qui compte vraiment vient des fonctions de
// src/lib/{couple,program}/*.ts, qui typent explicitement leurs
// paramètres et leurs valeurs de retour. À revisiter avec
// `supabase gen types typescript` une fois un projet Supabase réel lié
// au dépôt.
