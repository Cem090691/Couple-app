-- Reconnect — schéma initial
--
-- Principe de sécurité central (voir AGENTS produit, section 9) :
-- la confidentialité des réponses individuelles est garantie par les
-- policies RLS ci-dessous, PAS par l'interface. Un partenaire ne peut
-- JAMAIS lire la réponse brute de l'autre via une requête API, quelle
-- qu'elle soit : la policy SELECT sur `answers` restreint toujours à
-- `user_id = auth.uid()`. La seule façon de comparer les réponses des
-- deux partenaires est la fonction `get_week_insights`, qui tourne en
-- SECURITY DEFINER et ne renvoie jamais le contenu brut d'une réponse
-- qui ne correspond pas à celle de l'autre — seulement un résultat
-- dérivé (match / pas match).

create extension if not exists pgcrypto;

-- =========================================================================
-- 1. Profils
-- =========================================================================

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text,
  created_at timestamptz not null default now()
);

comment on table public.profiles is
  'Un profil par utilisateur, créé automatiquement à l''inscription. Ne contient aucune donnée sensible : c''est la seule table lisible par les deux membres d''un couple.';

-- =========================================================================
-- 2. Parcours (tracks) & contenu du programme
--
-- Contenu global, identique pour tous les couples. Le MVP ne construit
-- que le parcours "reconnect-6-weeks" + le mode continu "continue",
-- mais la structure permet d'ajouter d'autres parcours plus tard sans
-- migration de schéma (section "FUTURS PARCOURS").
-- =========================================================================

create table public.tracks (
  id text primary key,
  title text not null,
  description text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.program_weeks (
  id uuid primary key default gen_random_uuid(),
  track_id text not null references public.tracks (id) on delete cascade,
  week_number int not null,
  title text not null,
  objective text,
  experience_title text,
  experience_instructions text,
  created_at timestamptz not null default now(),
  unique (track_id, week_number)
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  week_id uuid not null references public.program_weeks (id) on delete cascade,
  position int not null,
  prompt text not null,
  kind text not null check (kind in ('scale', 'text', 'choice')),
  -- pour kind = 'choice' : [{ "value": "temps_ensemble", "label": "Temps ensemble" }, ...]
  options jsonb,
  created_at timestamptz not null default now(),
  unique (week_id, position)
);

-- =========================================================================
-- 3. Couples
-- =========================================================================

create table public.couples (
  id uuid primary key default gen_random_uuid(),
  active_track_id text not null references public.tracks (id) default 'reconnect-6-weeks',
  active_week_number int not null default 1,
  program_completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.couple_members (
  couple_id uuid not null references public.couples (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (couple_id, user_id),
  unique (user_id) -- un utilisateur n'appartient qu'à un seul couple à la fois
);

create table public.couple_invitations (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  code text not null unique,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  used_at timestamptz,
  used_by uuid references auth.users (id) on delete set null
);

create index couple_invitations_couple_id_idx on public.couple_invitations (couple_id);

-- =========================================================================
-- 4. Réponses & progression
-- =========================================================================

create table public.answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  couple_id uuid not null references public.couples (id) on delete cascade,
  -- scale -> {"scale": 1..5} · choice -> {"choice": "temps_ensemble"} · text -> {"text": "..."}
  value jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (question_id, user_id)
);

create index answers_couple_id_idx on public.answers (couple_id);
create index answers_user_id_idx on public.answers (user_id);

create table public.weekly_progress (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  week_id uuid not null references public.program_weeks (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  questions_completed_at timestamptz,
  experience_completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (week_id, user_id)
);

create index weekly_progress_couple_id_idx on public.weekly_progress (couple_id);

-- =========================================================================
-- 5. Triggers
-- =========================================================================

-- Création automatique du profil à l'inscription (même pattern que la
-- table `teachers` du projet ClassFlow).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name)
  values (new.id, new.raw_user_meta_data ->> 'first_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Un couple ne peut jamais avoir plus de deux membres.
create function public.enforce_couple_size()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from public.couple_members where couple_id = new.couple_id) >= 2 then
    raise exception 'couple_full' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger couple_members_size_check
  before insert on public.couple_members
  for each row execute function public.enforce_couple_size();

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger answers_set_updated_at
  before update on public.answers
  for each row execute function public.set_updated_at();

-- =========================================================================
-- 6. Fonctions d'accès (SECURITY DEFINER) — le seul chemin autorisé pour
--    tout ce qui touche à plusieurs comptes à la fois (rejoindre un
--    couple, quitter un couple, comparer des réponses).
-- =========================================================================

create function public.my_couple_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select couple_id from public.couple_members where user_id = auth.uid() limit 1;
$$;

create function public.generate_invite_code()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  -- caractères ambigus (0/O, 1/I/L) exclus pour rester lisible à l'oral/à l'écrit
  chars text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  result text;
begin
  loop
    result := '';
    for i in 1..6 loop
      result := result || substr(chars, 1 + floor(random() * length(chars))::int, 1);
    end loop;
    exit when not exists (select 1 from public.couple_invitations where code = result);
  end loop;
  return result;
end;
$$;

-- Crée un couple pour l'utilisateur courant et une invitation à partager.
create function public.create_couple_and_invite()
returns table (couple_id uuid, code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_couple_id uuid;
  v_code text;
begin
  if public.my_couple_id() is not null then
    raise exception 'already_in_couple' using errcode = 'P0001';
  end if;

  insert into public.couples default values returning id into v_couple_id;
  insert into public.couple_members (couple_id, user_id) values (v_couple_id, auth.uid());

  v_code := public.generate_invite_code();
  insert into public.couple_invitations (couple_id, code, created_by)
  values (v_couple_id, v_code, auth.uid());

  return query select v_couple_id, v_code;
end;
$$;

-- Rejoint un couple existant via son code d'invitation.
create function public.join_couple_by_code(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invitation public.couple_invitations;
begin
  if public.my_couple_id() is not null then
    raise exception 'already_in_couple' using errcode = 'P0001';
  end if;

  select * into v_invitation
  from public.couple_invitations
  where code = upper(trim(p_code))
  for update;

  if not found then
    raise exception 'invalid_code' using errcode = 'P0001';
  end if;
  if v_invitation.used_at is not null then
    raise exception 'code_already_used' using errcode = 'P0001';
  end if;
  if v_invitation.expires_at < now() then
    raise exception 'code_expired' using errcode = 'P0001';
  end if;
  if (select count(*) from public.couple_members where couple_id = v_invitation.couple_id) >= 2 then
    raise exception 'couple_full' using errcode = 'P0001';
  end if;

  insert into public.couple_members (couple_id, user_id) values (v_invitation.couple_id, auth.uid());

  update public.couple_invitations
  set used_at = now(), used_by = auth.uid()
  where id = v_invitation.id;

  return v_invitation.couple_id;
end;
$$;

-- Quitte le couple courant. Dissout entièrement l'espace partagé : les
-- deux membres perdent l'accès et toutes les données du couple
-- (réponses, progression, invitations) sont supprimées en cascade.
-- C'est un choix volontairement simple (voir section 9 & 24 du brief
-- produit) : un couple ne "survit" pas au départ d'un membre.
create function public.leave_couple()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_couple_id uuid := public.my_couple_id();
begin
  if v_couple_id is null then
    raise exception 'not_in_couple' using errcode = 'P0001';
  end if;

  delete from public.couples where id = v_couple_id;
end;
$$;

-- Compare les réponses des deux partenaires pour une semaine donnée et
-- renvoie uniquement un résultat dérivé : jamais le contenu brut d'une
-- réponse qui ne correspond pas à celle de l'autre.
create function public.get_week_insights(p_week_id uuid)
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
        if (v_mine ->> 'choice') = (v_theirs ->> 'choice') then
          v_item := v_item || jsonb_build_object('match', true, 'shared_value', v_mine ->> 'choice');
        else
          v_item := v_item || jsonb_build_object('match', false);
        end if;
      elsif q.kind = 'scale' then
        v_item := v_item || jsonb_build_object(
          'match', abs((v_mine ->> 'scale')::int - (v_theirs ->> 'scale')::int) <= 1
        );
      else
        -- kind = 'text' : jamais de comparaison automatique, jamais de contenu renvoyé
        v_item := v_item || jsonb_build_object('match', null);
      end if;
    end if;

    v_result := v_result || jsonb_build_array(v_item);
  end loop;

  return v_result;
end;
$$;

-- Fait avancer le couple à la semaine suivante (ou bascule vers le mode
-- "continue" après la semaine 6) une fois que les DEUX partenaires ont
-- terminé questions + expérience de la semaine en cours.
create function public.advance_current_week()
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

  if v_couple.active_track_id = 'reconnect-6-weeks' and v_couple.active_week_number >= 6 then
    update public.couples
    set active_track_id = 'continue', active_week_number = 1, program_completed_at = now()
    where id = v_couple.id;
  elsif v_couple.active_track_id = 'continue' then
    -- Le mode continu tourne en boucle sur le contenu semé pour cette
    -- piste : ajouter des semaines dans `program_weeks` (track 'continue')
    -- allonge le cycle sans toucher au code.
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
-- 7. Row Level Security
-- =========================================================================

alter table public.profiles enable row level security;
alter table public.tracks enable row level security;
alter table public.program_weeks enable row level security;
alter table public.questions enable row level security;
alter table public.couples enable row level security;
alter table public.couple_members enable row level security;
alter table public.couple_invitations enable row level security;
alter table public.answers enable row level security;
alter table public.weekly_progress enable row level security;

-- Contenu global du programme : lecture libre pour tout utilisateur
-- authentifié, aucune écriture cliente (géré par les migrations).
create policy "tracks readable by authenticated" on public.tracks
  for select to authenticated using (true);
create policy "program_weeks readable by authenticated" on public.program_weeks
  for select to authenticated using (true);
create policy "questions readable by authenticated" on public.questions
  for select to authenticated using (true);

-- Profils : chacun voit et modifie le sien ; on voit aussi le prénom
-- (uniquement) de son partenaire.
create policy "profiles select own or partner" on public.profiles
  for select to authenticated using (
    id = auth.uid()
    or exists (
      select 1 from public.couple_members cm
      where cm.user_id = profiles.id and cm.couple_id = public.my_couple_id()
    )
  );
create policy "profiles update own" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Couples : lecture pour les membres uniquement. Toute écriture passe
-- par les fonctions SECURITY DEFINER ci-dessus (aucune policy INSERT/
-- UPDATE/DELETE cliente : un membre ne peut pas patcher directement
-- active_week_number pour sauter des semaines).
create policy "couples select own" on public.couples
  for select to authenticated using (id = public.my_couple_id());

create policy "couple_members select own couple" on public.couple_members
  for select to authenticated using (couple_id = public.my_couple_id());

create policy "couple_invitations select own couple" on public.couple_invitations
  for select to authenticated using (couple_id = public.my_couple_id());

-- Réponses : le cœur de la confidentialité. Personne ne peut jamais
-- lire la réponse brute d'un autre utilisateur, même son partenaire,
-- même dans le même couple.
create policy "answers select own only" on public.answers
  for select to authenticated using (user_id = auth.uid());
create policy "answers insert own only" on public.answers
  for insert to authenticated with check (user_id = auth.uid() and couple_id = public.my_couple_id());
create policy "answers update own only" on public.answers
  for update to authenticated using (user_id = auth.uid())
  with check (user_id = auth.uid() and couple_id = public.my_couple_id());

-- Progression hebdomadaire : les timestamps de complétion (pas le
-- contenu) sont visibles par les deux partenaires, pour afficher
-- "en attente de votre partenaire".
create policy "weekly_progress select own couple" on public.weekly_progress
  for select to authenticated using (couple_id = public.my_couple_id());
create policy "weekly_progress insert own only" on public.weekly_progress
  for insert to authenticated with check (user_id = auth.uid() and couple_id = public.my_couple_id());
create policy "weekly_progress update own only" on public.weekly_progress
  for update to authenticated using (user_id = auth.uid())
  with check (user_id = auth.uid() and couple_id = public.my_couple_id());
