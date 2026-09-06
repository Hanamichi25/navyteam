-- Fase 11 — Consentimiento de política de datos + estado de acceso del cliente.
--
-- 1. `user_consents`: registro de que un usuario aceptó la Política de
--    Tratamiento de Datos Personales (Ley 1581/2012), con versión y fecha.
-- 2. `client_access_status(cid)`: para el coach dueño de la ficha, en qué
--    punto del alta por invitación está su cliente ('none' | 'invited' | 'active').
--
-- El borrado en cascada de los datos de dominio de un cliente ya lo garantizan
-- los `on delete cascade` de `0001` (clients → body_measurements, client_routines,
-- payments, workout_sessions → workout_exercise_logs → workout_set_logs, messages).
-- La Edge Function `delete-client` solo añade el borrado del usuario de Auth
-- (que a su vez cascadea su fila de `user_consents` por el FK de abajo).

-- ===========================================================================
-- user_consents
-- ===========================================================================

create table public.user_consents (
  user_id        uuid primary key references auth.users (id) on delete cascade,
  policy_version text not null,
  accepted_at    timestamptz not null default now()
);

alter table public.user_consents enable row level security;

create policy user_consents_self_select on public.user_consents
  for select to authenticated
  using (user_id = auth.uid());

create policy user_consents_self_insert on public.user_consents
  for insert to authenticated
  with check (user_id = auth.uid());

create policy user_consents_self_update on public.user_consents
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select, insert, update on public.user_consents to authenticated;

-- ===========================================================================
-- client_access_status(cid): estado del alta por invitación de un cliente.
-- SECURITY DEFINER para poder leer auth.users; guard interno de propiedad.
-- ===========================================================================

create or replace function public.client_access_status(cid text)
returns text
language plpgsql
security definer
stable
set search_path = ''
as $$
declare
  uid uuid;
  confirmed timestamptz;
begin
  select c.client_user_id into uid
  from public.clients c
  where c.id = cid and c.coach_id = auth.uid();

  if not found or uid is null then
    return 'none';
  end if;

  select u.email_confirmed_at into confirmed
  from auth.users u
  where u.id = uid;

  if confirmed is not null then
    return 'active';
  end if;
  return 'invited';
end;
$$;

grant execute on function public.client_access_status(text) to authenticated;

-- ===========================================================================
-- consent_report(): registro auditable de aceptaciones de la política.
-- Devuelve la propia aceptación del coach + la de los usuarios ligados a sus
-- clientes. SECURITY DEFINER para poder leer auth.users; el WHERE limita el
-- alcance a lo que el llamante puede auditar.
-- ===========================================================================

create or replace function public.consent_report()
returns table (
  user_id        uuid,
  email          text,
  name           text,
  role           text,
  policy_version text,
  accepted_at    timestamptz
)
language sql
security definer
stable
set search_path = ''
as $$
  select uc.user_id,
         u.email,
         coalesce(u.raw_user_meta_data->>'name', u.email)     as name,
         coalesce(u.raw_user_meta_data->>'role', 'desconocido') as role,
         uc.policy_version,
         uc.accepted_at
  from public.user_consents uc
  join auth.users u on u.id = uc.user_id
  where uc.user_id = auth.uid()
     or exists (
       select 1 from public.clients c
       where c.client_user_id = uc.user_id and c.coach_id = auth.uid()
     )
  order by uc.accepted_at desc;
$$;

grant execute on function public.consent_report() to authenticated;
