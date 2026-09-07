-- Fase 16 — Índices que faltaban sobre FK con ON DELETE SET NULL.
--
-- El esquema (0001/0004/0006) ya indexa casi todas las FK y las columnas de
-- filtro frecuentes. Estas tres quedaron sin índice: todas son FK
-- `on delete set null` hacia tablas que crecen con el uso (clients, y los logs
-- de entrenos). Sin índice, cada borrado del lado "uno" (un plan, un ejercicio,
-- una rutina) fuerza un seq scan de la tabla "muchos" para poner a NULL las
-- filas que lo referencian.
--
-- `if not exists` para que sea seguro re-aplicar. `concurrently` NO se usa
-- porque el CLI corre las migraciones dentro de una transacción y Postgres lo
-- prohíbe ahí; estas tablas son chicas hoy, el lock de un `create index` normal
-- es instantáneo.

-- clients.nutrition_plan_id → al borrar un NutritionPlan (RESTRICT/SET NULL).
create index if not exists clients_nutrition_plan_id_idx
  on public.clients (nutrition_plan_id);

-- workout_exercise_logs.exercise_id → al borrar un Exercise del catálogo.
create index if not exists workout_exercise_logs_exercise_id_idx
  on public.workout_exercise_logs (exercise_id);

-- workout_sessions.routine_id → al borrar una Routine del catálogo.
create index if not exists workout_sessions_routine_id_idx
  on public.workout_sessions (routine_id);


-- ===========================================================================
-- Rate limiting para las Edge Functions (invite-client / delete-client).
--
-- Ya validan coach + ownership de la ficha, pero un token robado o un bug del
-- cliente podría llamarlas en bucle (cada invitación manda un email; cada
-- borrado toca varias tablas + Auth). Ventana deslizante simple por clave.
-- ===========================================================================

create table if not exists public.rate_limit (
  key          text primary key,
  window_start timestamptz not null default now(),
  count        int not null default 0
);

alter table public.rate_limit enable row level security;
-- Sin políticas: solo el service_role de las Edge Functions la toca (vía la
-- función de abajo, SECURITY DEFINER). `authenticated` no tiene acceso.

/**
 * Registra un intento contra `p_key` y devuelve `true` si está DENTRO del
 * límite (`p_max` intentos por ventana deslizante de `p_window_seconds` s),
 * `false` si lo excede. Atómica: el `insert ... on conflict` toma el lock de
 * la fila, así que llamadas concurrentes con la misma clave se serializan.
 *
 * `expired` = la ventana guardada ya venció → se reinicia (nueva ventana,
 * count 1). Si no, se acumula sobre la ventana vigente.
 */
create or replace function public.check_rate_limit(
  p_key text,
  p_max int,
  p_window_seconds int
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  insert into public.rate_limit as rl (key, window_start, count)
    values (p_key, now(), 1)
  on conflict (key) do update
    set
      window_start = case
        when rl.window_start < now() - make_interval(secs => p_window_seconds) then now()
        else rl.window_start
      end,
      count = case
        when rl.window_start < now() - make_interval(secs => p_window_seconds) then 1
        else rl.count + 1
      end
  returning count into v_count;

  return v_count <= p_max;
end;
$$;

revoke all on function public.check_rate_limit(text, int, int) from public, authenticated, anon;

