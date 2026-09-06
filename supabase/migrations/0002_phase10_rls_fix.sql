-- Fase 10 — Fix de RLS: separar "soy el coach de" de "soy el cliente".
--
-- Bug: `is_my_client(cid)` devolvía true tanto si `coach_id = auth.uid()` como
-- si `client_user_id = auth.uid()`. Las políticas `*_coach_all` (FOR ALL) la
-- usaban, así que un usuario `client` heredaba UPDATE/DELETE sobre sus propias
-- sesiones, mediciones, asignaciones y **pagos** — que debían ser de solo
-- lectura para él (AGENTS.md: "El cliente NO puede borrar sus sesiones").
--
-- Solución: dos helpers separados. Las políticas del coach comprueban
-- `is_coach_of`; las de lectura del cliente, `is_client_of`; mensajería, ambas.

create or replace function public.is_coach_of(cid text)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.clients c
    where c.id = cid and c.coach_id = auth.uid()
  );
$$;

create or replace function public.is_client_of(cid text)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.clients c
    where c.id = cid and c.client_user_id = auth.uid()
  );
$$;

grant execute on function public.is_coach_of(text) to authenticated;
grant execute on function public.is_client_of(text) to authenticated;

-- --- body_measurements -----------------------------------------------------
drop policy if exists body_measurements_coach_all   on public.body_measurements;
drop policy if exists body_measurements_client_read on public.body_measurements;

create policy body_measurements_coach_all on public.body_measurements
  for all to authenticated
  using (public.is_coach_of(client_id))
  with check (public.is_coach_of(client_id));

create policy body_measurements_client_read on public.body_measurements
  for select to authenticated
  using (public.is_client_of(client_id));

-- --- client_routines -----------------------------------------------------
drop policy if exists client_routines_coach_all   on public.client_routines;
drop policy if exists client_routines_client_read on public.client_routines;

create policy client_routines_coach_all on public.client_routines
  for all to authenticated
  using (public.is_coach_of(client_id))
  with check (public.is_coach_of(client_id));

create policy client_routines_client_read on public.client_routines
  for select to authenticated
  using (public.is_client_of(client_id));

-- --- payments -----------------------------------------------------------
drop policy if exists payments_coach_all   on public.payments;
drop policy if exists payments_client_read on public.payments;

create policy payments_coach_all on public.payments
  for all to authenticated
  using (public.is_coach_of(client_id))
  with check (public.is_coach_of(client_id));

create policy payments_client_read on public.payments
  for select to authenticated
  using (public.is_client_of(client_id));

-- --- workout_sessions --------------------------------------------------
drop policy if exists workout_sessions_coach_all     on public.workout_sessions;
drop policy if exists workout_sessions_client_read   on public.workout_sessions;
drop policy if exists workout_sessions_client_insert on public.workout_sessions;

create policy workout_sessions_coach_all on public.workout_sessions
  for all to authenticated
  using (public.is_coach_of(client_id))
  with check (public.is_coach_of(client_id));

create policy workout_sessions_client_read on public.workout_sessions
  for select to authenticated
  using (public.is_client_of(client_id));

create policy workout_sessions_client_insert on public.workout_sessions
  for insert to authenticated
  with check (public.is_client_of(client_id));

-- --- workout_exercise_logs ------------------------------------------
drop policy if exists workout_exercise_logs_coach_all     on public.workout_exercise_logs;
drop policy if exists workout_exercise_logs_client_read   on public.workout_exercise_logs;
drop policy if exists workout_exercise_logs_client_insert on public.workout_exercise_logs;

create policy workout_exercise_logs_coach_all on public.workout_exercise_logs
  for all to authenticated
  using (exists (
    select 1 from public.workout_sessions s
    where s.id = workout_exercise_logs.session_id and public.is_coach_of(s.client_id)
  ))
  with check (exists (
    select 1 from public.workout_sessions s
    where s.id = workout_exercise_logs.session_id and public.is_coach_of(s.client_id)
  ));

create policy workout_exercise_logs_client_read on public.workout_exercise_logs
  for select to authenticated
  using (exists (
    select 1 from public.workout_sessions s
    where s.id = workout_exercise_logs.session_id and public.is_client_of(s.client_id)
  ));

create policy workout_exercise_logs_client_insert on public.workout_exercise_logs
  for insert to authenticated
  with check (exists (
    select 1 from public.workout_sessions s
    where s.id = workout_exercise_logs.session_id and public.is_client_of(s.client_id)
  ));

-- --- workout_set_logs ----------------------------------------------
drop policy if exists workout_set_logs_coach_all     on public.workout_set_logs;
drop policy if exists workout_set_logs_client_read   on public.workout_set_logs;
drop policy if exists workout_set_logs_client_insert on public.workout_set_logs;

create policy workout_set_logs_coach_all on public.workout_set_logs
  for all to authenticated
  using (exists (
    select 1
    from public.workout_exercise_logs l
    join public.workout_sessions s on s.id = l.session_id
    where l.id = workout_set_logs.exercise_log_id and public.is_coach_of(s.client_id)
  ))
  with check (exists (
    select 1
    from public.workout_exercise_logs l
    join public.workout_sessions s on s.id = l.session_id
    where l.id = workout_set_logs.exercise_log_id and public.is_coach_of(s.client_id)
  ));

create policy workout_set_logs_client_read on public.workout_set_logs
  for select to authenticated
  using (exists (
    select 1
    from public.workout_exercise_logs l
    join public.workout_sessions s on s.id = l.session_id
    where l.id = workout_set_logs.exercise_log_id and public.is_client_of(s.client_id)
  ));

create policy workout_set_logs_client_insert on public.workout_set_logs
  for insert to authenticated
  with check (exists (
    select 1
    from public.workout_exercise_logs l
    join public.workout_sessions s on s.id = l.session_id
    where l.id = workout_set_logs.exercise_log_id and public.is_client_of(s.client_id)
  ));

-- --- messages (coach y cliente participan; ambos leen y escriben) ----
drop policy if exists messages_participant_read   on public.messages;
drop policy if exists messages_participant_insert on public.messages;

create policy messages_participant_read on public.messages
  for select to authenticated
  using (public.is_coach_of(client_id) or public.is_client_of(client_id));

create policy messages_participant_insert on public.messages
  for insert to authenticated
  with check (public.is_coach_of(client_id) or public.is_client_of(client_id));

-- Ya no se usa.
drop function if exists public.is_my_client(text);
