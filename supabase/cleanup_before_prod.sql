-- Limpieza previa al despliegue de producción.
--
-- Decisiones (2026-09-06):
--   · Se CONSERVA la cuenta entrenador@navyteam.com (cambiar email/contraseña/
--     nombre desde el Dashboard → Authentication, ver AGENTS.md).
--   · Se CONSERVA el catálogo: exercises, routines, nutrition_plans (+ comidas),
--     foods. Todo pertenece a ese coach, que se mantiene → no hay que reasignar.
--   · Se BORRAN: los 5 clientes demo y su actividad, el usuario de prueba del
--     cliente, y los restos de pruebas (consentimiento de test, dismissals,
--     notificaciones, push tokens).
--
-- Pegar en el SQL Editor de Supabase (corre como `postgres`, salta RLS).
-- Revisar antes de ejecutar. Todo va en una transacción.

begin;

-- 1) Clientes demo. La cascada de FKs elimina también:
--    body_measurements · client_routines · payments · workout_sessions
--    (+ workout_exercise_logs + workout_set_logs) · messages
--    (incluido el mensaje de verificación `verif_..._msg`).
delete from public.clients
where id in ('cli_maria', 'cli_pedro', 'cli_ana', 'cli_sofia', 'cli_luis');

-- 2) Usuario de prueba del cliente. Cascada: user_consents · push_tokens ·
--    notifications de ese usuario. (clients.client_user_id ya quedó a NULL o
--    borrado en el paso 1, así que no bloquea.)
delete from auth.users where email = 'cliente@navyteam.com';

-- 3) Consentimiento del coach registrado durante las pruebas → que el
--    entrenador real lo acepte de cero (traza de auditoría limpia).
--    Comentar esta línea si prefieres conservarlo.
delete from public.user_consents
where user_id = (select id from auth.users where email = 'entrenador@navyteam.com');

-- 4) Restos de pruebas del panel y del push.
delete from public.dashboard_dismissals;
delete from public.notifications;
delete from public.push_tokens;

commit;

-- --------------------------------------------------------------------------
-- Verificación: lo que queda.
-- --------------------------------------------------------------------------
select 'clients'              as tabla, count(*) from public.clients
union all select 'workout_sessions',    count(*) from public.workout_sessions
union all select 'body_measurements',   count(*) from public.body_measurements
union all select 'client_routines',     count(*) from public.client_routines
union all select 'payments',            count(*) from public.payments
union all select 'messages',            count(*) from public.messages
union all select 'notifications',       count(*) from public.notifications
union all select 'user_consents',       count(*) from public.user_consents
union all select '— exercises (keep)',  count(*) from public.exercises
union all select '— routines (keep)',   count(*) from public.routines
union all select '— nutrition_plans (keep)', count(*) from public.nutrition_plans
union all select '— nutrition_meals (keep)', count(*) from public.nutrition_meals
union all select '— foods (keep)',      count(*) from public.foods
union all select 'auth.users restantes', count(*) from auth.users;
