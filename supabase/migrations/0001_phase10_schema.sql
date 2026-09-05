-- Fase 10 — Esquema de datos + RLS por rol (coach / client).
--
-- Sustituye los mocks de AsyncStorage por Postgres. Las interfaces `Gateway`
-- de la app no cambian; cada `*Gateway.supabase.ts` mapea estas filas
-- (snake_case) a los tipos de dominio (camelCase).
--
-- Convenciones:
--   * PK `text`: se siembran con los ids legibles de los `*.mock.ts`
--     (cli_luis, rtn_001, exc_squat, nut_001). Filas nuevas: el Gateway
--     genera el id con `createId()`.
--   * Fechas puntuales como `date`; marcas de tiempo como `timestamptz`.
--   * Campos tipo enum = `text` + CHECK que refleja la unión de TypeScript.
--   * `coach_id` por defecto = `auth.uid()` en las tablas que crea el coach.
--     Las filas que crea el cliente (workout_sessions y sus hijas) no llevan
--     `coach_id`: la RLS se resuelve por el join a `clients`.

-- ===========================================================================
-- Catálogos del coach
-- ===========================================================================

create table public.exercises (
  id           text primary key,
  coach_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name         text not null,
  muscle_group text not null check (muscle_group in (
                 'chest','back','legs','shoulders','arms','core','cardio','full_body')),
  equipment    text not null,
  description  text,
  media_url    text,
  created_at   timestamptz not null default now()
);
create index exercises_coach_id_idx on public.exercises (coach_id);

create table public.routines (
  id           text primary key,
  coach_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name         text not null,
  category     text not null check (category in ('strength','cardio','flexibility')),
  level        text not null check (level in ('beginner','intermediate','advanced')),
  duration_min integer not null default 0,
  image_url    text not null default '',
  created_at   timestamptz not null default now()
);
create index routines_coach_id_idx on public.routines (coach_id);

create table public.routine_blocks (
  id             text primary key,
  routine_id     text not null references public.routines (id) on delete cascade,
  exercise_id    text not null references public.exercises (id) on delete restrict,
  position       integer not null default 0,
  sets           integer not null default 0,
  reps_min       integer not null default 0,
  reps_max       integer not null default 0,
  suggested_load text not null default '',
  rest_sec       integer not null default 0
);
create index routine_blocks_routine_id_idx on public.routine_blocks (routine_id);
create index routine_blocks_exercise_id_idx on public.routine_blocks (exercise_id);

create table public.nutrition_plans (
  id           text primary key,
  coach_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name         text not null,
  category     text not null check (category in ('weight_loss','volume','maintenance')),
  kcal_per_day integer not null default 0,
  protein_pct  integer not null default 0,
  carbs_pct    integer not null default 0,
  fat_pct      integer not null default 0,
  image_url    text not null default '',
  notes        text,
  created_at   timestamptz not null default now()
);
create index nutrition_plans_coach_id_idx on public.nutrition_plans (coach_id);

-- ===========================================================================
-- Clientes y su dominio
-- ===========================================================================

create table public.clients (
  id                text primary key,
  coach_id          uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- Enlace para RLS: qué usuario de Supabase ES este cliente. Nullable: una
  -- ficha puede existir sin que el cliente tenga acceso a la app todavía.
  client_user_id    uuid references auth.users (id) on delete set null,
  name              text not null,
  avatar_url        text not null default '',
  goal              text not null check (goal in ('weight_loss','muscle_gain','maintenance')),
  birth_date        date,
  email             text,
  phone             text,
  notes             text,
  height_cm         numeric not null default 0,
  goal_kg           numeric not null default 0,
  monthly_fee_eur   numeric not null default 0,
  member_since      date not null default current_date,
  -- Denormalizado: lo mantiene registerPayment (= max(payments.covers_until)).
  subscription_until date,
  -- Un cliente tiene como mucho un plan a la vez → columna, no tabla.
  nutrition_plan_id text references public.nutrition_plans (id) on delete set null,
  created_at        timestamptz not null default now()
);
create index clients_coach_id_idx on public.clients (coach_id);
create index clients_client_user_id_idx on public.clients (client_user_id);
create unique index clients_client_user_id_uq on public.clients (client_user_id)
  where client_user_id is not null;

create table public.body_measurements (
  id        text primary key,
  client_id text not null references public.clients (id) on delete cascade,
  date      date not null,
  weight_kg numeric not null,
  waist_cm  numeric,
  chest_cm  numeric,
  hip_cm    numeric,
  arm_cm    numeric
);
create index body_measurements_client_id_idx on public.body_measurements (client_id);

create table public.client_routines (
  id         text primary key,
  client_id  text not null references public.clients (id) on delete cascade,
  routine_id text not null references public.routines (id) on delete cascade,
  schedule   text not null default '',
  unique (client_id, routine_id)
);
create index client_routines_client_id_idx on public.client_routines (client_id);
create index client_routines_routine_id_idx on public.client_routines (routine_id);

create table public.payments (
  id          text primary key,
  client_id   text not null references public.clients (id) on delete cascade,
  date        date not null,
  amount_eur  numeric not null,
  months      integer not null,
  covers_until date not null
);
create index payments_client_id_idx on public.payments (client_id);

-- ===========================================================================
-- Entrenamientos (los escribe el coach o el propio cliente)
-- ===========================================================================

create table public.workout_sessions (
  id           text primary key,
  client_id    text not null references public.clients (id) on delete cascade,
  routine_id   text references public.routines (id) on delete set null,
  routine_name text not null,
  date         date not null,
  duration_min integer,
  notes        text,
  created_at   timestamptz not null default now()
);
create index workout_sessions_client_id_date_idx on public.workout_sessions (client_id, date desc);

create table public.workout_exercise_logs (
  id            text primary key,
  session_id    text not null references public.workout_sessions (id) on delete cascade,
  exercise_id   text references public.exercises (id) on delete set null,
  exercise_name text not null,
  position      integer not null default 0
);
create index workout_exercise_logs_session_id_idx on public.workout_exercise_logs (session_id);

create table public.workout_set_logs (
  id              text primary key,
  exercise_log_id text not null references public.workout_exercise_logs (id) on delete cascade,
  set_number      integer not null,
  reps            integer not null,
  weight_kg       numeric not null,
  rpe             numeric
);
create index workout_set_logs_exercise_log_id_idx on public.workout_set_logs (exercise_log_id);

-- ===========================================================================
-- Mensajería (un hilo por cliente; coach ↔ client)
-- ===========================================================================

create table public.messages (
  id        text primary key,
  client_id text not null references public.clients (id) on delete cascade,
  sender    text not null check (sender in ('coach','client')),
  text      text not null,
  sent_at   timestamptz not null default now()
);
create index messages_client_id_sent_at_idx on public.messages (client_id, sent_at);

-- ===========================================================================
-- Helper de RLS: ¿la ficha `cid` pertenece al usuario actual (como coach o
-- como el propio cliente)? SECURITY DEFINER para no recursar sobre las
-- políticas de `clients`.
-- ===========================================================================
create or replace function public.is_my_client(cid text)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.clients c
    where c.id = cid
      and (c.coach_id = auth.uid() or c.client_user_id = auth.uid())
  );
$$;

-- ===========================================================================
-- Row Level Security
-- ===========================================================================

alter table public.exercises            enable row level security;
alter table public.routines             enable row level security;
alter table public.routine_blocks       enable row level security;
alter table public.nutrition_plans      enable row level security;
alter table public.clients              enable row level security;
alter table public.body_measurements    enable row level security;
alter table public.client_routines      enable row level security;
alter table public.payments             enable row level security;
alter table public.workout_sessions     enable row level security;
alter table public.workout_exercise_logs enable row level security;
alter table public.workout_set_logs     enable row level security;
alter table public.messages             enable row level security;

-- --- exercises -------------------------------------------------------------
create policy exercises_coach_all on public.exercises
  for all to authenticated
  using (coach_id = auth.uid())
  with check (coach_id = auth.uid());

create policy exercises_client_read on public.exercises
  for select to authenticated
  using (coach_id in (
    select c.coach_id from public.clients c where c.client_user_id = auth.uid()
  ));

-- --- routines -------------------------------------------------------------
create policy routines_coach_all on public.routines
  for all to authenticated
  using (coach_id = auth.uid())
  with check (coach_id = auth.uid());

create policy routines_client_read on public.routines
  for select to authenticated
  using (exists (
    select 1
    from public.client_routines cr
    join public.clients c on c.id = cr.client_id
    where cr.routine_id = routines.id
      and c.client_user_id = auth.uid()
  ));

-- --- routine_blocks ------------------------------------------------------
create policy routine_blocks_coach_all on public.routine_blocks
  for all to authenticated
  using (exists (
    select 1 from public.routines r
    where r.id = routine_blocks.routine_id and r.coach_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.routines r
    where r.id = routine_blocks.routine_id and r.coach_id = auth.uid()
  ));

create policy routine_blocks_client_read on public.routine_blocks
  for select to authenticated
  using (exists (
    select 1
    from public.client_routines cr
    join public.clients c on c.id = cr.client_id
    where cr.routine_id = routine_blocks.routine_id
      and c.client_user_id = auth.uid()
  ));

-- --- nutrition_plans ----------------------------------------------------
create policy nutrition_plans_coach_all on public.nutrition_plans
  for all to authenticated
  using (coach_id = auth.uid())
  with check (coach_id = auth.uid());

create policy nutrition_plans_client_read on public.nutrition_plans
  for select to authenticated
  using (id in (
    select c.nutrition_plan_id from public.clients c where c.client_user_id = auth.uid()
  ));

-- --- clients -----------------------------------------------------------
create policy clients_coach_all on public.clients
  for all to authenticated
  using (coach_id = auth.uid())
  with check (coach_id = auth.uid());

create policy clients_client_read on public.clients
  for select to authenticated
  using (client_user_id = auth.uid());

-- --- body_measurements / client_routines / payments -------------------
create policy body_measurements_coach_all on public.body_measurements
  for all to authenticated
  using (public.is_my_client(client_id))
  with check (public.is_my_client(client_id));

create policy body_measurements_client_read on public.body_measurements
  for select to authenticated
  using (public.is_my_client(client_id));

create policy client_routines_coach_all on public.client_routines
  for all to authenticated
  using (public.is_my_client(client_id))
  with check (public.is_my_client(client_id));

create policy client_routines_client_read on public.client_routines
  for select to authenticated
  using (public.is_my_client(client_id));

create policy payments_coach_all on public.payments
  for all to authenticated
  using (public.is_my_client(client_id))
  with check (public.is_my_client(client_id));

create policy payments_client_read on public.payments
  for select to authenticated
  using (public.is_my_client(client_id));

-- --- workout_sessions -------------------------------------------------
-- Coach: control total sobre las sesiones de sus clientes.
create policy workout_sessions_coach_all on public.workout_sessions
  for all to authenticated
  using (public.is_my_client(client_id))
  with check (public.is_my_client(client_id));

-- Cliente: lee y registra sus propias sesiones. NO borra ni edita.
create policy workout_sessions_client_read on public.workout_sessions
  for select to authenticated
  using (public.is_my_client(client_id));

create policy workout_sessions_client_insert on public.workout_sessions
  for insert to authenticated
  with check (public.is_my_client(client_id));

-- --- workout_exercise_logs ------------------------------------------
create policy workout_exercise_logs_coach_all on public.workout_exercise_logs
  for all to authenticated
  using (exists (
    select 1 from public.workout_sessions s
    where s.id = workout_exercise_logs.session_id and public.is_my_client(s.client_id)
  ))
  with check (exists (
    select 1 from public.workout_sessions s
    where s.id = workout_exercise_logs.session_id and public.is_my_client(s.client_id)
  ));

create policy workout_exercise_logs_client_read on public.workout_exercise_logs
  for select to authenticated
  using (exists (
    select 1 from public.workout_sessions s
    where s.id = workout_exercise_logs.session_id and public.is_my_client(s.client_id)
  ));

create policy workout_exercise_logs_client_insert on public.workout_exercise_logs
  for insert to authenticated
  with check (exists (
    select 1 from public.workout_sessions s
    where s.id = workout_exercise_logs.session_id and public.is_my_client(s.client_id)
  ));

-- --- workout_set_logs ----------------------------------------------
create policy workout_set_logs_coach_all on public.workout_set_logs
  for all to authenticated
  using (exists (
    select 1
    from public.workout_exercise_logs l
    join public.workout_sessions s on s.id = l.session_id
    where l.id = workout_set_logs.exercise_log_id and public.is_my_client(s.client_id)
  ))
  with check (exists (
    select 1
    from public.workout_exercise_logs l
    join public.workout_sessions s on s.id = l.session_id
    where l.id = workout_set_logs.exercise_log_id and public.is_my_client(s.client_id)
  ));

create policy workout_set_logs_client_read on public.workout_set_logs
  for select to authenticated
  using (exists (
    select 1
    from public.workout_exercise_logs l
    join public.workout_sessions s on s.id = l.session_id
    where l.id = workout_set_logs.exercise_log_id and public.is_my_client(s.client_id)
  ));

create policy workout_set_logs_client_insert on public.workout_set_logs
  for insert to authenticated
  with check (exists (
    select 1
    from public.workout_exercise_logs l
    join public.workout_sessions s on s.id = l.session_id
    where l.id = workout_set_logs.exercise_log_id and public.is_my_client(s.client_id)
  ));

-- --- messages -----------------------------------------------------
create policy messages_participant_read on public.messages
  for select to authenticated
  using (public.is_my_client(client_id));

create policy messages_participant_insert on public.messages
  for insert to authenticated
  with check (public.is_my_client(client_id));

-- ===========================================================================
-- Grants para el rol `authenticated` (la RLS decide qué filas; los grants,
-- qué operaciones a nivel de tabla).
-- ===========================================================================

grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant execute on function public.is_my_client(text) to authenticated;
