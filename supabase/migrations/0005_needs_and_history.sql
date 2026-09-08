-- Choix multiples, libellés d'échelle, comparaison approchée du texte
-- libre par mots-clés, et mémoire simple du couple.
--
-- Voir la discussion produit : les questions "de quoi as-tu besoin"
-- doivent permettre plusieurs réponses ; chaque échelle 1-5 doit pouvoir
-- afficher ce que signifie la valeur choisie ; deux réponses libres
-- différentes mais évoquant le même besoin doivent pouvoir être
-- rapprochées (par mots-clés, pas par IA — cohérent avec le choix
-- initial de ne pas construire d'IA dans le MVP) ; chaque semaine
-- terminée doit laisser une trace dans un historique simple.

-- =========================================================================
-- 1. Schéma : choix multiples + libellés d'échelle
-- =========================================================================

alter table public.questions
  add column allow_multiple boolean not null default false,
  add column scale_labels jsonb;

comment on column public.questions.allow_multiple is
  'Pour kind = ''choice'' uniquement : autorise la sélection de plusieurs options. La réponse est alors stockée {"choices": [...]} plutôt que {"choice": "..."}.';
comment on column public.questions.scale_labels is
  'Pour kind = ''scale'' uniquement : 5 libellés (ex. ["Pas du tout proche", ..., "Très proche"]) affichés sous l''échelle quand une valeur est sélectionnée.';

-- =========================================================================
-- 2. Comparaison approchée du texte libre, par mots-clés
--
-- Volontairement simple et data-driven (table éditable), pas de modèle
-- de langage : on cherche si les deux réponses évoquent la même
-- catégorie de besoin parmi les 7 utilisées ailleurs dans l'app.
-- =========================================================================

create extension if not exists unaccent with schema public;

create table public.need_keywords (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  keyword text not null
);

alter table public.need_keywords enable row level security;
create policy "need_keywords readable by authenticated" on public.need_keywords
  for select to authenticated using (true);

insert into public.need_keywords (category, keyword) values
  ('temps_ensemble', 'temps ensemble'),
  ('temps_ensemble', 'temps a deux'),
  ('temps_ensemble', 'rien que'),
  ('temps_ensemble', 'plus de temps'),
  ('temps_ensemble', 'passer du temps'),
  ('temps_ensemble', 'choses ensemble'),
  ('temps_ensemble', 'moment a deux'),
  ('temps_ensemble', 'moments ensemble'),
  ('temps_ensemble', 'week-end ensemble'),
  ('temps_ensemble', 'weekend ensemble'),
  ('affection', 'affection'),
  ('affection', 'tendress'),
  ('affection', 'calin'),
  ('affection', 'cajoler'),
  ('affection', 'embrasser'),
  ('communication', 'parler'),
  ('communication', 'communiqu'),
  ('communication', 'discuter'),
  ('communication', 'echanger'),
  ('communication', 'dialogue'),
  ('communication', 'exprimer'),
  ('spontaneite', 'spontan'),
  ('spontaneite', 'surprise'),
  ('spontaneite', 'imprevu'),
  ('spontaneite', 'improviser'),
  ('sorties', 'sortir'),
  ('sorties', 'sortie'),
  ('sorties', 'restaurant'),
  ('sorties', 'ballade'),
  ('sorties', 'promenade'),
  ('sorties', 'diner dehors'),
  ('attention', 'attention'),
  ('attention', 'remarqu'),
  ('attention', 'compliment'),
  ('attention', 'prendre soin'),
  ('intimite', 'intimite'),
  ('intimite', 'desir'),
  ('intimite', 'physique'),
  ('intimite', 'sexuel');

create function public.infer_need_categories(input text)
returns text[]
language sql
stable
set search_path = public
as $$
  select coalesce(array_agg(distinct category), '{}'::text[])
  from public.need_keywords
  where input is not null
    and position(lower(public.unaccent(keyword)) in lower(public.unaccent(input))) > 0;
$$;

-- =========================================================================
-- 3. Mémoire simple du couple : une ligne par semaine terminée
-- =========================================================================

create table public.couple_week_history (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  track_id text not null references public.tracks (id),
  week_number int not null,
  week_title text not null,
  completed_at timestamptz not null default now()
);

create index couple_week_history_couple_id_idx on public.couple_week_history (couple_id);

alter table public.couple_week_history enable row level security;
create policy "couple_week_history select own couple" on public.couple_week_history
  for select to authenticated using (couple_id = public.my_couple_id());

grant select, insert, update, delete on public.need_keywords, public.couple_week_history to authenticated;

-- =========================================================================
-- 4. advance_current_week() : enregistre la semaine dans l'historique
-- =========================================================================

create or replace function public.advance_current_week()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_couple public.couples;
  v_week public.program_weeks;
  v_member_count int;
  v_done_count int;
begin
  select * into v_couple from public.couples where id = public.my_couple_id();
  if v_couple.id is null then
    raise exception 'not_in_couple' using errcode = 'P0001';
  end if;

  select * into v_week
  from public.program_weeks
  where track_id = v_couple.active_track_id and week_number = v_couple.active_week_number;

  select count(*) into v_member_count from public.couple_members where couple_id = v_couple.id;

  select count(*) into v_done_count
  from public.weekly_progress
  where week_id = v_week.id
    and couple_id = v_couple.id
    and questions_completed_at is not null
    and experience_completed_at is not null;

  if v_member_count < 2 or v_done_count < v_member_count then
    raise exception 'week_not_complete' using errcode = 'P0001';
  end if;

  insert into public.couple_week_history (couple_id, track_id, week_number, week_title, completed_at)
  values (v_couple.id, v_couple.active_track_id, v_couple.active_week_number, v_week.title, now());

  if v_couple.active_track_id = 'reconnect-6-weeks' and v_couple.active_week_number >= 6 then
    update public.couples
    set active_track_id = 'continue', active_week_number = 1, program_completed_at = now()
    where id = v_couple.id;
  elsif v_couple.active_track_id = 'continue' then
    update public.couples
    set active_week_number = (
      select (v_couple.active_week_number % count(*)) + 1
      from public.program_weeks
      where track_id = 'continue'
    )
    where id = v_couple.id;
  else
    update public.couples
    set active_week_number = active_week_number + 1
    where id = v_couple.id;
  end if;
end;
$$;

-- =========================================================================
-- 5. get_week_insights() : ensembles (choix multiples) + inférence texte
--
-- Toujours le même principe de confidentialité : le contenu d'une
-- réponse texte qui ne correspond à rien n'est jamais renvoyé, et pour
-- les différences de choix, on renvoie seulement "y a-t-il un point
-- commun", jamais la liste des choix de l'autre qui ne matchent pas.
-- =========================================================================

create or replace function public.get_week_insights(p_week_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_couple_id uuid := public.my_couple_id();
  v_partner_id uuid;
  v_result jsonb := '[]'::jsonb;
  q record;
  v_mine jsonb;
  v_theirs jsonb;
  v_item jsonb;
  v_mine_cats text[];
  v_theirs_cats text[];
  v_common text[];
begin
  if v_couple_id is null then
    raise exception 'not_in_couple' using errcode = 'P0001';
  end if;

  select user_id into v_partner_id
  from public.couple_members
  where couple_id = v_couple_id and user_id <> auth.uid();

  for q in
    select id, kind, prompt, position
    from public.questions
    where week_id = p_week_id
    order by position
  loop
    select value into v_mine from public.answers where question_id = q.id and user_id = auth.uid();
    v_theirs := null;
    if v_partner_id is not null then
      select value into v_theirs from public.answers where question_id = q.id and user_id = v_partner_id;
    end if;

    v_item := jsonb_build_object(
      'question_id', q.id,
      'kind', q.kind,
      'both_answered', (v_mine is not null and v_theirs is not null)
    );

    if v_mine is not null and v_theirs is not null then
      if q.kind = 'choice' then
        v_mine_cats := case
          when v_mine ? 'choices' then (select array_agg(x) from jsonb_array_elements_text(v_mine -> 'choices') x)
          else array[v_mine ->> 'choice']
        end;
        v_theirs_cats := case
          when v_theirs ? 'choices' then (select array_agg(x) from jsonb_array_elements_text(v_theirs -> 'choices') x)
          else array[v_theirs ->> 'choice']
        end;

        select array_agg(distinct c) into v_common from unnest(v_mine_cats) c where c = any(v_theirs_cats);

        v_item := v_item || jsonb_build_object(
          'match', coalesce(array_length(v_common, 1), 0) > 0,
          'common', coalesce(to_jsonb(v_common), '[]'::jsonb),
          'inferred', false
        );
      elsif q.kind = 'scale' then
        v_item := v_item || jsonb_build_object(
          'match', abs((v_mine ->> 'scale')::int - (v_theirs ->> 'scale')::int) <= 1,
          'inferred', false
        );
      else
        v_mine_cats := public.infer_need_categories(v_mine ->> 'text');
        v_theirs_cats := public.infer_need_categories(v_theirs ->> 'text');

        select array_agg(distinct c) into v_common from unnest(v_mine_cats) c where c = any(v_theirs_cats);

        v_item := v_item || jsonb_build_object(
          'match', coalesce(array_length(v_common, 1), 0) > 0,
          'common', coalesce(to_jsonb(v_common), '[]'::jsonb),
          'inferred', true
        );
      end if;
    end if;

    v_result := v_result || jsonb_build_array(v_item);
  end loop;

  return v_result;
end;
$$;

-- =========================================================================
-- 6. Contenu : emojis + choix multiples sur les questions "besoins"
-- =========================================================================

update public.questions set allow_multiple = true, options = '[
  {"value": "affection", "label": "❤️ Affection"},
  {"value": "temps_ensemble", "label": "🕐 Temps ensemble"},
  {"value": "communication", "label": "💬 Communication"},
  {"value": "spontaneite", "label": "✨ Spontanéité"},
  {"value": "sorties", "label": "🍿 Sorties"},
  {"value": "attention", "label": "👀 Attention"},
  {"value": "intimite", "label": "🔥 Intimité"}
]'::jsonb
where prompt in (
  'Qu''aimerais-tu retrouver davantage dans votre relation ?',
  'Qu''est-ce qui te ferait te sentir plus proche de ton/ta partenaire cette semaine ?',
  'De quoi as-tu le plus besoin en ce moment dans votre relation ?',
  'De quoi aurais-tu le plus besoin cette semaine ?',
  'Qu''est-ce qui vous ferait du bien de faire ensemble cette semaine ?',
  'De quoi as-tu le plus besoin cette semaine ?',
  'De quoi aurais-tu le plus besoin la semaine prochaine ?'
);

-- =========================================================================
-- 7. Contenu : libellés des 20 questions à échelle
-- =========================================================================

update public.questions set scale_labels = '["Pas du tout proche", "Plutôt distant(e)", "Moyennement proche", "Plutôt proche", "Très proche"]'::jsonb
  where prompt = 'À quel point te sens-tu proche de ton/ta partenaire aujourd''hui ?';
update public.questions set scale_labels = '["Très peu", "Peu", "Un peu", "Assez", "Beaucoup"]'::jsonb
  where prompt = 'À quel point avez-vous, ces derniers temps, du temps de qualité ensemble ?';
update public.questions set scale_labels = '["Pas du tout compris(e)", "Peu compris(e)", "Moyennement compris(e)", "Plutôt bien compris(e)", "Très compris(e)"]'::jsonb
  where prompt = 'À quel point te sens-tu compris(e) par ton/ta partenaire ?';
update public.questions set scale_labels = '["Pas du tout", "Rarement", "Parfois", "Souvent", "Très souvent"]'::jsonb
  where prompt = 'À quel point te sens-tu remarqué(e) au quotidien ?';
update public.questions set scale_labels = '["Pas du tout désiré(e)", "Peu désiré(e)", "Moyennement désiré(e)", "Plutôt désiré(e)", "Très désiré(e)"]'::jsonb
  where prompt = 'À quel point te sens-tu désiré(e) par ton/ta partenaire en ce moment ?';
update public.questions set scale_labels = '["Très difficile", "Difficile", "Ni facile ni difficile", "Facile", "Très facile"]'::jsonb
  where prompt = 'À quel point est-il facile pour toi de parler de désir avec ton/ta partenaire ?';
update public.questions set scale_labels = '["Très peu", "Peu", "Un peu", "Assez", "Beaucoup"]'::jsonb
  where prompt = 'Ces dernières semaines, à quel point avez-vous des moments rien que tous les deux ?';
update public.questions set scale_labels = '["Pas du tout", "Un peu", "Moyennement", "Plutôt bien", "Très bien"]'::jsonb
  where prompt = 'À quel point sens-tu que tes besoins sont pris en compte au quotidien ?';
update public.questions set scale_labels = '["Pas du tout", "Un peu", "Moyennement", "Plutôt oui", "Beaucoup plus"]'::jsonb
  where prompt = 'Vous sentez-vous plus proches qu''il y a 6 semaines ?';
update public.questions set scale_labels = '["Pas bien", "Plutôt difficile", "Neutre", "Plutôt bien", "Très bien"]'::jsonb
  where prompt = 'Comment te sens-tu dans votre couple cette semaine ?';
update public.questions set scale_labels = '["Pas du tout", "Peu", "Moyennement", "Plutôt proche", "Très proche"]'::jsonb
  where prompt = 'Te sens-tu proche de ton/ta partenaire actuellement ?';
update public.questions set scale_labels = '["Pas du tout", "Peu", "Moyennement", "Plutôt bien", "Très bien"]'::jsonb
  where prompt = 'As-tu l''impression d''être écouté(e) ces derniers jours ?';
update public.questions set scale_labels = '["Pas du tout", "Peu", "Moyennement", "Plutôt bien", "Très complices"]'::jsonb
  where prompt = 'À quel point vous sentez-vous complices en ce moment ?';
update public.questions set scale_labels = '["Pas du tout", "Un peu", "Moyennement", "Assez", "Beaucoup"]'::jsonb
  where prompt = 'As-tu envie de plus de tendresse en ce moment ?';
update public.questions set scale_labels = '["Pas du tout", "Peu", "Moyennement", "Plutôt bien", "Très bien"]'::jsonb
  where prompt = 'Te sens-tu écouté(e) sur ce qui compte pour toi en ce moment ?';
update public.questions set scale_labels = '["Pas satisfait(e)", "Peu satisfait(e)", "Neutre", "Plutôt satisfait(e)", "Très satisfait(e)"]'::jsonb
  where prompt = 'Comment te sens-tu par rapport à votre proximité physique en ce moment ?';
update public.questions set scale_labels = '["Pas du tout", "Un peu", "Moyennement", "Assez", "Beaucoup"]'::jsonb
  where prompt = 'As-tu envie de plus de spontanéité dans votre relation en ce moment ?';
update public.questions set scale_labels = '["Très difficile", "Difficile", "Correcte", "Fluide", "Très fluide"]'::jsonb
  where prompt = 'À quel point la communication est-elle fluide entre vous en ce moment ?';
update public.questions set scale_labels = '["Pas bien", "Plutôt difficile", "Neutre", "Plutôt bien", "Très bien"]'::jsonb
  where prompt = 'Globalement, comment te sens-tu dans votre relation cette semaine ?';

-- =========================================================================
-- 8. Renommage cohérent avec la nouvelle présentation produit
-- =========================================================================

update public.tracks set title = 'Se retrouver', description = 'Le parcours guidé de 6 semaines pour se reconnecter.'
  where id = 'reconnect-6-weeks';
update public.tracks set title = 'Notre rituel', description = 'Le check-in hebdomadaire, après le parcours initial.'
  where id = 'continue';
