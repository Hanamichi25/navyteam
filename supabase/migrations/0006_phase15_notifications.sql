-- Fase 15 — Notificaciones (bandeja in-app + push).
--
-- Dos tablas:
--   · `push_tokens`     — tokens de Expo Push por usuario/dispositivo.
--   · `notifications`    — bandeja in-app (registro duradero); la fuente del push.
--
-- Los triggers de dominio (mensajes, sesión registrada por el cliente, rutina /
-- plan asignado, pago) escriben filas en `notifications` para el destinatario.
-- Un `_notify()` común inserta la fila y, si `app_config` tiene `edge_url`,
-- dispara la Edge Function `send-push` vía pg_net (best-effort).
--
-- Activación del push (ver AGENTS.md):
--   insert into public.app_config(key,value) values
--     ('edge_url','https://<ref>.supabase.co/functions/v1'),
--     ('push_secret','<aleatorio>')
--   on conflict (key) do update set value = excluded.value;
--   npx supabase functions deploy send-push --no-verify-jwt
--   npx supabase secrets set PUSH_HOOK_SECRET=<el mismo aleatorio>

-- pg_net: si el plan no lo permite, el push queda inactivo pero la bandeja funciona.
do $$
begin
  create extension if not exists pg_net;
exception when others then
  raise notice 'pg_net no disponible; el push quedará inactivo hasta habilitarlo';
end $$;

-- ===========================================================================
-- Configuración interna (URL de las funciones + secreto del hook de push).
-- Sin políticas RLS: solo el owner / service_role la leen.
-- ===========================================================================
create table if not exists public.app_config (
  key   text primary key,
  value text not null
);
alter table public.app_config enable row level security;

-- ===========================================================================
-- push_tokens
-- ===========================================================================
create table public.push_tokens (
  token      text primary key,
  user_id    uuid not null references auth.users (id) on delete cascade,
  platform   text not null default 'unknown',
  updated_at timestamptz not null default now()
);
create index push_tokens_user_id_idx on public.push_tokens (user_id);

alter table public.push_tokens enable row level security;

create policy push_tokens_self on public.push_tokens
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select, insert, update, delete on public.push_tokens to authenticated;

-- ===========================================================================
-- notifications (bandeja del destinatario)
-- ===========================================================================
create table public.notifications (
  id         text primary key,
  user_id    uuid not null references auth.users (id) on delete cascade,
  kind       text not null check (kind in ('message','workout','routine','plan','payment','system')),
  title      text not null,
  body       text not null,
  data       jsonb not null default '{}'::jsonb,
  read_at    timestamptz,
  pushed_at  timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_created_idx on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

-- El destinatario lee / marca leído / borra lo suyo. Sin INSERT: solo los
-- triggers (SECURITY DEFINER) escriben.
create policy notifications_select on public.notifications
  for select to authenticated
  using (user_id = auth.uid());

create policy notifications_update on public.notifications
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy notifications_delete on public.notifications
  for delete to authenticated
  using (user_id = auth.uid());

grant select, update, delete on public.notifications to authenticated;

-- ===========================================================================
-- _notify: inserta la fila + dispara el push (best-effort).
-- ===========================================================================
create or replace function public._notify(
  p_user  uuid,
  p_kind  text,
  p_title text,
  p_body  text,
  p_data  jsonb
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id     text;
  v_url    text;
  v_secret text;
begin
  if p_user is null then
    return;
  end if;

  v_id := 'ntf_' || replace(gen_random_uuid()::text, '-', '');
  insert into public.notifications (id, user_id, kind, title, body, data)
  values (v_id, p_user, p_kind, p_title, p_body, coalesce(p_data, '{}'::jsonb));

  begin
    select value into v_url    from public.app_config where key = 'edge_url';
    select value into v_secret from public.app_config where key = 'push_secret';
    if v_url is not null then
      perform net.http_post(
        url     := v_url || '/send-push',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'x-push-secret', coalesce(v_secret, '')
        ),
        body    := jsonb_build_object('notification_id', v_id)
      );
    end if;
  exception when others then
    null; -- pg_net ausente o config incompleta: la bandeja ya tiene la fila.
  end;
end;
$$;

-- Solo los triggers la llaman: que no quede expuesta como RPC de PostgREST.
revoke all on function public._notify(uuid, text, text, text, jsonb) from public;
revoke all on function public._notify(uuid, text, text, text, jsonb) from anon, authenticated;

-- ===========================================================================
-- Triggers de dominio
-- ===========================================================================

-- --- mensajes: avisa a la otra parte del hilo -----------------------------
create or replace function public._on_message_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_coach       uuid;
  v_client_user uuid;
  v_client_name text;
  v_snippet     text;
begin
  select c.coach_id, c.client_user_id, c.name
    into v_coach, v_client_user, v_client_name
  from public.clients c
  where c.id = new.client_id;

  v_snippet := left(new.text, 140);

  if new.sender = 'client' then
    perform public._notify(
      v_coach, 'message', 'Mensaje de ' || coalesce(v_client_name, 'un cliente'),
      v_snippet,
      jsonb_build_object('type', 'message', 'clientId', new.client_id)
    );
  else
    perform public._notify(
      v_client_user, 'message', 'Mensaje de tu entrenador',
      v_snippet,
      jsonb_build_object('type', 'message', 'clientId', new.client_id)
    );
  end if;

  return null;
end;
$$;

create trigger notify_on_message
  after insert on public.messages
  for each row execute function public._on_message_insert();

-- --- sesión de entrenamiento: si la registró el propio cliente, avisa al coach
create or replace function public._on_workout_session_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_coach       uuid;
  v_client_user uuid;
  v_client_name text;
begin
  select c.coach_id, c.client_user_id, c.name
    into v_coach, v_client_user, v_client_name
  from public.clients c
  where c.id = new.client_id;

  -- Solo si el insert lo hizo el cliente (no el coach desde el panel).
  if v_client_user is not null and auth.uid() = v_client_user then
    perform public._notify(
      v_coach, 'workout', 'Entreno registrado',
      coalesce(v_client_name, 'Tu cliente') || ' completó ' || new.routine_name,
      jsonb_build_object('type', 'workout', 'clientId', new.client_id, 'sessionId', new.id)
    );
  end if;

  return null;
end;
$$;

create trigger notify_on_workout_session
  after insert on public.workout_sessions
  for each row execute function public._on_workout_session_insert();

-- --- rutina asignada: avisa al cliente ------------------------------------
create or replace function public._on_client_routine_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_client_user uuid;
  v_routine     text;
begin
  select c.client_user_id into v_client_user
  from public.clients c where c.id = new.client_id;

  select r.name into v_routine
  from public.routines r where r.id = new.routine_id;

  perform public._notify(
    v_client_user, 'routine', 'Nueva rutina asignada',
    'Tu entrenador te asignó: ' || coalesce(v_routine, 'una rutina'),
    jsonb_build_object('type', 'routine', 'routineId', new.routine_id)
  );

  return null;
end;
$$;

create trigger notify_on_client_routine
  after insert on public.client_routines
  for each row execute function public._on_client_routine_insert();

-- --- plan de alimentación asignado: avisa al cliente ----------------------
create or replace function public._on_client_plan_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_plan text;
begin
  if new.nutrition_plan_id is not null
     and new.nutrition_plan_id is distinct from old.nutrition_plan_id then
    select p.name into v_plan
    from public.nutrition_plans p where p.id = new.nutrition_plan_id;

    perform public._notify(
      new.client_user_id, 'plan', 'Nuevo plan de alimentación',
      'Tu entrenador te asignó: ' || coalesce(v_plan, 'un plan'),
      jsonb_build_object('type', 'plan', 'planId', new.nutrition_plan_id)
    );
  end if;

  return null;
end;
$$;

create trigger notify_on_client_plan
  after update of nutrition_plan_id on public.clients
  for each row execute function public._on_client_plan_change();

-- --- pago registrado: avisa al cliente ------------------------------------
create or replace function public._on_payment_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_client_user uuid;
begin
  select c.client_user_id into v_client_user
  from public.clients c where c.id = new.client_id;

  perform public._notify(
    v_client_user, 'payment', 'Pago registrado',
    'Tu entrenador registró un pago. Suscripción cubierta hasta '
      || to_char(new.covers_until, 'DD/MM/YYYY') || '.',
    jsonb_build_object('type', 'payment', 'clientId', new.client_id)
  );

  return null;
end;
$$;

create trigger notify_on_payment
  after insert on public.payments
  for each row execute function public._on_payment_insert();

-- ===========================================================================
-- Realtime: la bandeja se refresca sola al llegar una fila (también en web).
-- ===========================================================================
do $$
begin
  alter publication supabase_realtime add table public.notifications;
exception when others then
  raise notice 'No se pudo añadir notifications a supabase_realtime: %', sqlerrm;
end $$;
