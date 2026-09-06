-- Accorde au rôle `authenticated` les privilèges de base sur les tables
-- applicatives. RLS (voir 0001_init.sql) reste le vrai filtre ligne par
-- ligne ; sans ce GRANT, Postgres refuse l'accès avant même d'évaluer
-- les policies ("permission denied for table ...", code 42501).
--
-- Certains projets Supabase héritent de ces droits automatiquement à la
-- création des tables ; ce n'était pas le cas ici (tables créées via
-- migration CLI plutôt que depuis le dashboard), d'où ce correctif
-- explicite. `alter default privileges` couvre aussi les tables créées
-- par de futures migrations.

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;

grant usage, select on all sequences in schema public to authenticated;
grant execute on all functions in schema public to authenticated;

alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public
  grant select on tables to anon;
alter default privileges in schema public
  grant usage, select on sequences to authenticated;
alter default privileges in schema public
  grant execute on functions to authenticated;
