-- Limpieza de la "data de pruebas" que aparece en "Actividad reciente" del panel.
--
-- Borra SOLO la actividad sembrada por `seed.sql` (sesiones de entrenamiento,
-- mediciones y mensajes de demo). NO toca clientes, rutinas, ejercicios,
-- alimentos ni planes: el catálogo de trabajo se conserva.
--
-- Pegar en el SQL Editor de Supabase. Es idempotente.

begin;

-- Sesiones de entrenamiento de demo (y en cascada sus logs/series).
delete from public.workout_sessions where id like 'wko\_%';

-- Mediciones de demo.
delete from public.body_measurements where id like 'msr\_%';

-- Mensajes de demo.
delete from public.messages where id like 'msg\_%';

commit;

-- Comprobación: lo que queda en cada tabla.
select 'workout_sessions' as tabla, count(*) from public.workout_sessions
union all select 'body_measurements', count(*) from public.body_measurements
union all select 'messages', count(*) from public.messages;
