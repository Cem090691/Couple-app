-- Active les mises à jour en direct (Supabase Realtime) sur les deux
-- tables que l'app écoute : l'arrivée du/de la partenaire dans le
-- couple (écran "en attente") et sa progression hebdomadaire (accueil).
-- Sans ça, les policies RLS restent correctes mais les abonnements
-- `postgres_changes` de l'app ne reçoivent jamais d'événement.

alter publication supabase_realtime add table public.couple_members;
alter publication supabase_realtime add table public.weekly_progress;
