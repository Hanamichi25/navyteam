-- Fase 10 — Semilla portada 1:1 desde los `*.mock.ts`.
--
-- Cómo aplicar contra el proyecto remoto (el seed.sql del CLI solo corre en
-- `supabase db reset` local):
--   * pegar este archivo en el SQL Editor del dashboard, o
--   * psql "$DATABASE_URL" -f supabase/seed.sql
--
-- Requiere que exista el usuario entrenador (email de abajo) en auth.users.
-- Es idempotente: limpia las tablas de dominio antes de insertar.

do $$
declare
  coach uuid;
begin
  select id into coach from auth.users where email = 'entrenador@navyteam.com';
  if coach is null then
    raise exception 'No existe el usuario entrenador@navyteam.com en auth.users';
  end if;

  -- Limpieza (orden hijo → padre; los ON DELETE CASCADE cubren el resto).
  delete from public.messages;
  delete from public.workout_set_logs;
  delete from public.workout_exercise_logs;
  delete from public.workout_sessions;
  delete from public.payments;
  delete from public.client_routines;
  delete from public.body_measurements;
  delete from public.clients;
  delete from public.routine_blocks;
  delete from public.routines;
  delete from public.nutrition_meal_items;
  delete from public.nutrition_meals;
  delete from public.nutrition_plans;
  delete from public.foods;
  delete from public.exercises;

  -- ---------------------------------------------------------------------
  -- Ejercicios (EXERCISES_SEED)
  -- ---------------------------------------------------------------------
  insert into public.exercises (id, coach_id, name, muscle_group, equipment, description) values
    ('exc_bench_press',   coach, 'Press de banca',        'chest',     'Barra',         'Empuje horizontal en banco plano, agarre a la altura de los hombros.'),
    ('exc_barbell_row',   coach, 'Remo con barra',        'back',      'Barra',         'Tronco inclinado, tirar la barra hacia el abdomen.'),
    ('exc_squat',         coach, 'Sentadilla',            'legs',      'Barra',         'Barra en la espalda, descenso controlado hasta paralelo.'),
    ('exc_shoulder_press',coach, 'Press militar',         'shoulders', 'Mancuernas',    'Empuje vertical por encima de la cabeza, de pie o sentado.'),
    ('exc_bicep_curl',    coach, 'Curl de bíceps',        'arms',      'Mancuernas',    null),
    ('exc_plank',         coach, 'Plancha',               'core',      'Peso corporal', 'Isométrico, cuerpo alineado apoyado en antebrazos y pies.'),
    ('exc_lunges',        coach, 'Zancadas',              'legs',      'Mancuernas',    null),
    ('exc_lat_pulldown',  coach, 'Jalón al pecho',        'back',      'Máquina',       null),
    ('exc_lateral_raise', coach, 'Elevaciones laterales', 'shoulders', 'Mancuernas',    null),
    ('exc_burpees',       coach, 'Burpees',               'full_body', 'Peso corporal', null),
    ('exc_treadmill',     coach, 'Cinta de correr',       'cardio',    'Máquina',       null);

  -- ---------------------------------------------------------------------
  -- Rutinas (ROUTINES_SEED) + rtn_006 (referida por cli_pedro en clients.mock)
  -- ---------------------------------------------------------------------
  insert into public.routines (id, coach_id, name, category, level, duration_min, image_url) values
    ('rtn_001', coach, 'Piernas y Glúteos',   'strength',    'intermediate', 45, 'https://picsum.photos/seed/navyteam-legs/640/360'),
    ('rtn_002', coach, 'Cardio HIIT',          'cardio',      'intermediate', 20, 'https://picsum.photos/seed/navyteam-hiit/640/360'),
    ('rtn_003', coach, 'Fuerza Superior',      'strength',    'advanced',     50, 'https://picsum.photos/seed/navyteam-upper/640/360'),
    ('rtn_004', coach, 'Flexibilidad Total',   'flexibility', 'beginner',     30, 'https://picsum.photos/seed/navyteam-flex/640/360'),
    ('rtn_005', coach, 'Cardio Quema Grasa',   'cardio',      'beginner',     35, 'https://picsum.photos/seed/navyteam-fatburn/640/360'),
    ('rtn_006', coach, 'Empuje / Tirón',       'strength',    'advanced',     55, 'https://picsum.photos/seed/navyteam-pushpull/640/360');

  insert into public.routine_blocks (id, routine_id, exercise_id, position, sets, reps_min, reps_max, suggested_load, rest_sec) values
    ('blk_001', 'rtn_001', 'exc_squat',         0, 4,  8, 10, '40 kg',         90),
    ('blk_002', 'rtn_001', 'exc_lunges',        1, 3, 10, 12, '12 kg',         60),
    ('blk_003', 'rtn_002', 'exc_burpees',       0, 4, 12, 15, 'Peso corporal', 45),
    ('blk_004', 'rtn_002', 'exc_treadmill',     1, 1,  1,  1, 'RPE 8',          0),
    ('blk_005', 'rtn_003', 'exc_bench_press',   0, 5,  5,  6, '60 kg',        120),
    ('blk_006', 'rtn_003', 'exc_barbell_row',   1, 4,  6,  8, '50 kg',         90),
    ('blk_007', 'rtn_004', 'exc_plank',         0, 3,  1,  1, '30 seg',        30),
    ('blk_008', 'rtn_004', 'exc_lunges',        1, 2, 10, 10, 'Peso corporal', 30),
    ('blk_009', 'rtn_005', 'exc_treadmill',     0, 1,  1,  1, 'RPE 6',          0),
    ('blk_010', 'rtn_005', 'exc_burpees',       1, 3, 10, 12, 'Peso corporal', 60),
    ('blk_011', 'rtn_006', 'exc_shoulder_press',0, 4,  6,  8, '30 kg',         90),
    ('blk_012', 'rtn_006', 'exc_lat_pulldown',  1, 4,  8, 10, '45 kg',         90);

  -- ---------------------------------------------------------------------
  -- Alimentos (FOODS_SEED) — Fase 12
  -- ---------------------------------------------------------------------
  insert into public.foods (id, coach_id, name, unit, ref_quantity, kcal, protein_g, carbs_g, fat_g) values
    ('fd_huevo',        coach, 'Huevo',                 'unidad', 1,   78,  6.3, 0.6, 5.3),
    ('fd_clara',        coach, 'Clara de huevo',        'unidad', 1,   17,  3.6, 0.2, 0.1),
    ('fd_avena',        coach, 'Avena',                 'g',      100, 379, 13,  68,  7),
    ('fd_arroz_blanco', coach, 'Arroz blanco cocido',   'g',      100, 130, 2.7, 28,  0.3),
    ('fd_arroz_int',    coach, 'Arroz integral cocido', 'g',      100, 111, 2.6, 23,  0.9),
    ('fd_pasta',        coach, 'Pasta cocida',          'g',      100, 158, 6,   31,  0.9),
    ('fd_pan_int',      coach, 'Pan integral',          'g',      100, 247, 13,  41,  3.4),
    ('fd_pollo',        coach, 'Pechuga de pollo',      'g',      100, 165, 31,  0,   3.6),
    ('fd_res',          coach, 'Carne de res magra',    'g',      100, 187, 27,  0,   8),
    ('fd_salmon',       coach, 'Salmón',                'g',      100, 208, 20,  0,   13),
    ('fd_atun',         coach, 'Atún en agua',          'g',      100, 116, 26,  0,   1),
    ('fd_lentejas',     coach, 'Lentejas cocidas',      'g',      100, 116, 9,   20,  0.4),
    ('fd_frijoles',     coach, 'Frijoles cocidos',      'g',      100, 127, 9,   22,  0.5),
    ('fd_papa',         coach, 'Papa cocida',           'g',      100, 87,  1.9, 20,  0.1),
    ('fd_batata',       coach, 'Batata cocida',         'g',      100, 90,  2,   21,  0.1),
    ('fd_platano',      coach, 'Plátano',               'unidad', 1,   105, 1.3, 27,  0.4),
    ('fd_manzana',      coach, 'Manzana',               'unidad', 1,   95,  0.5, 25,  0.3),
    ('fd_aguacate',     coach, 'Aguacate',              'unidad', 1,   240, 3,   12,  22),
    ('fd_almendras',    coach, 'Almendras',             'g',      100, 579, 21,  22,  50),
    ('fd_aceite_oliva', coach, 'Aceite de oliva',       'ml',     100, 884, 0,   0,   100),
    ('fd_leche',        coach, 'Leche entera',          'ml',     100, 61,  3.2, 4.8, 3.3),
    ('fd_yogur_griego', coach, 'Yogur griego natural',  'g',      100, 97,  9,   4,   5),
    ('fd_queso_fresco', coach, 'Queso fresco',          'g',      100, 98,  11,  3,   4),
    ('fd_brocoli',      coach, 'Brócoli',               'g',      100, 34,  2.8, 7,   0.4);

  -- ---------------------------------------------------------------------
  -- Planes de alimentación (Fase 12: objetivo opcional + comidas)
  -- ---------------------------------------------------------------------
  insert into public.nutrition_plans (id, coach_id, name, category, target_kcal_per_day, image_url, notes) values
    ('nut_001', coach, 'Plan Déficit Calórico',          'weight_loss', 1800, 'https://picsum.photos/seed/navyteam-salad/640/360',   'Prioriza proteína en cada comida. Verduras libres.'),
    ('nut_002', coach, 'Plan Volumen Limpio',            'volume',      3200, 'https://picsum.photos/seed/navyteam-mealprep/640/360', null),
    ('nut_003', coach, 'Plan Mantenimiento Equilibrado', 'maintenance', 2400, 'https://picsum.photos/seed/navyteam-bowl/640/360',    null),
    ('nut_004', coach, 'Plan Recomposición',             'weight_loss', 2100, 'https://picsum.photos/seed/navyteam-recomp/640/360',  null);

  insert into public.nutrition_meals (id, plan_id, name, position) values
    ('meal_n1_1', 'nut_001', 'Desayuno', 0),
    ('meal_n1_2', 'nut_001', 'Almuerzo', 1),
    ('meal_n1_3', 'nut_001', 'Cena',     2),
    ('meal_n2_1', 'nut_002', 'Desayuno', 0),
    ('meal_n2_2', 'nut_002', 'Almuerzo', 1),
    ('meal_n2_3', 'nut_002', 'Merienda', 2),
    ('meal_n2_4', 'nut_002', 'Cena',     3);

  insert into public.nutrition_meal_items (id, meal_id, food_id, food_name, quantity, position) values
    ('mi_n1_1a', 'meal_n1_1', 'fd_huevo',        'Huevo',                 2,   0),
    ('mi_n1_1b', 'meal_n1_1', 'fd_avena',        'Avena',                 40,  1),
    ('mi_n1_1c', 'meal_n1_1', 'fd_manzana',      'Manzana',               1,   2),
    ('mi_n1_2a', 'meal_n1_2', 'fd_pollo',        'Pechuga de pollo',      150, 0),
    ('mi_n1_2b', 'meal_n1_2', 'fd_arroz_int',    'Arroz integral cocido', 120, 1),
    ('mi_n1_2c', 'meal_n1_2', 'fd_brocoli',      'Brócoli',               150, 2),
    ('mi_n1_3a', 'meal_n1_3', 'fd_atun',         'Atún en agua',          120, 0),
    ('mi_n1_3b', 'meal_n1_3', 'fd_papa',         'Papa cocida',           150, 1),
    ('mi_n2_1a', 'meal_n2_1', 'fd_huevo',        'Huevo',                 3,   0),
    ('mi_n2_1b', 'meal_n2_1', 'fd_avena',        'Avena',                 80,  1),
    ('mi_n2_1c', 'meal_n2_1', 'fd_leche',        'Leche entera',          250, 2),
    ('mi_n2_1d', 'meal_n2_1', 'fd_platano',      'Plátano',               1,   3),
    ('mi_n2_2a', 'meal_n2_2', 'fd_res',          'Carne de res magra',    200, 0),
    ('mi_n2_2b', 'meal_n2_2', 'fd_arroz_blanco', 'Arroz blanco cocido',   200, 1),
    ('mi_n2_2c', 'meal_n2_2', 'fd_aceite_oliva', 'Aceite de oliva',       10,  2),
    ('mi_n2_3a', 'meal_n2_3', 'fd_yogur_griego', 'Yogur griego natural',  200, 0),
    ('mi_n2_3b', 'meal_n2_3', 'fd_almendras',    'Almendras',             30,  1),
    ('mi_n2_4a', 'meal_n2_4', 'fd_salmon',       'Salmón',                180, 0),
    ('mi_n2_4b', 'meal_n2_4', 'fd_pasta',        'Pasta cocida',          150, 1);

  -- ---------------------------------------------------------------------
  -- Clientes (CLIENT_DETAILS_SEED)
  -- ---------------------------------------------------------------------
  insert into public.clients
    (id, coach_id, name, avatar_url, goal, birth_date, email, phone, height_cm, goal_kg,
     monthly_fee_eur, member_since, subscription_until, nutrition_plan_id) values
    ('cli_maria', coach, 'María López',    'https://i.pravatar.cc/150?img=32', 'weight_loss',  '1996-03-14', 'maria.lopez@correo.com',     '+34 611 222 333', 168, 60, 45, '2025-01-01', '2026-10-15', 'nut_001'),
    ('cli_pedro', coach, 'Pedro García',   'https://i.pravatar.cc/150?img=15', 'muscle_gain',  '1990-07-22', 'pedro.garcia@correo.com',    '+34 622 333 444', 175, 82, 40, '2024-11-01', '2026-09-28', 'nut_002'),
    ('cli_ana',   coach, 'Ana Martínez',   'https://i.pravatar.cc/150?img=47', 'maintenance',  '1988-11-05', 'ana.martinez@correo.com',    '+34 633 444 555', 162, 60, 35, '2025-03-01', '2026-08-20', 'nut_003'),
    ('cli_luis',  coach, 'Luis Fernández', 'https://i.pravatar.cc/150?img=13', 'muscle_gain',  '1993-01-30', 'luis.fernandez@correo.com',  '+34 644 555 666', 180, 86, 50, '2024-08-01', '2026-09-06', 'nut_002'),
    ('cli_sofia', coach, 'Sofía Ruiz',     'https://i.pravatar.cc/150?img=24', 'weight_loss',  '1998-09-18', 'sofia.ruiz@correo.com',      '+34 655 666 777', 165, 55, 38, '2025-02-01', '2026-09-30', 'nut_001');

  -- Mediciones (más antigua primero = punto de partida)
  insert into public.body_measurements (id, client_id, date, weight_kg) values
    ('msr_maria_1', 'cli_maria', '2025-01-05', 72),
    ('msr_maria_2', 'cli_maria', '2025-03-10', 68),
    ('msr_maria_3', 'cli_maria', '2025-05-20', 65),
    ('msr_pedro_1', 'cli_pedro', '2024-11-15', 74),
    ('msr_pedro_2', 'cli_pedro', '2025-02-10', 76),
    ('msr_pedro_3', 'cli_pedro', '2025-06-05', 78),
    ('msr_ana_1',   'cli_ana',   '2025-03-20', 61),
    ('msr_ana_2',   'cli_ana',   '2025-06-15', 60),
    ('msr_luis_1',  'cli_luis',  '2024-08-01', 76),
    ('msr_luis_2',  'cli_luis',  '2025-01-01', 79),
    ('msr_luis_3',  'cli_luis',  '2025-07-01', 82),
    ('msr_sofia_1', 'cli_sofia', '2025-02-10', 64),
    ('msr_sofia_2', 'cli_sofia', '2025-05-01', 61),
    ('msr_sofia_3', 'cli_sofia', '2025-08-01', 58);

  -- Rutinas asignadas
  insert into public.client_routines (id, client_id, routine_id, schedule) values
    ('cr_maria_1', 'cli_maria', 'rtn_001', 'Lun/Mié/Vie'),
    ('cr_maria_2', 'cli_maria', 'rtn_002', 'Mar/Jue'),
    ('cr_pedro_1', 'cli_pedro', 'rtn_003', 'Lun/Jue'),
    ('cr_pedro_2', 'cli_pedro', 'rtn_006', 'Mar/Vie'),
    ('cr_ana_1',   'cli_ana',   'rtn_004', 'Lun/Mié/Vie'),
    ('cr_luis_1',  'cli_luis',  'rtn_003', 'Lun/Mié/Vie'),
    ('cr_sofia_1', 'cli_sofia', 'rtn_002', 'Lun/Mié/Vie'),
    ('cr_sofia_2', 'cli_sofia', 'rtn_005', 'Sáb');

  -- Pagos
  insert into public.payments (id, client_id, date, amount_eur, months, covers_until) values
    ('pay_maria_1', 'cli_maria', '2026-06-15',  45, 1, '2026-07-15'),
    ('pay_maria_2', 'cli_maria', '2026-07-15', 135, 3, '2026-10-15'),
    ('pay_pedro_1', 'cli_pedro', '2026-08-28',  40, 1, '2026-09-28'),
    ('pay_ana_1',   'cli_ana',   '2026-07-20',  35, 1, '2026-08-20'),
    ('pay_luis_1',  'cli_luis',  '2026-07-06',  50, 1, '2026-08-06'),
    ('pay_luis_2',  'cli_luis',  '2026-08-06',  50, 1, '2026-09-06'),
    ('pay_sofia_1', 'cli_sofia', '2026-08-30',  38, 1, '2026-09-30');

  -- ---------------------------------------------------------------------
  -- Sesiones de entrenamiento (WORKOUT_SESSIONS_SEED)
  -- ---------------------------------------------------------------------
  insert into public.workout_sessions (id, client_id, routine_id, routine_name, date, duration_min, notes) values
    ('wko_maria_1', 'cli_maria', 'rtn_001', 'Piernas y Glúteos', '2026-07-25', 58, null),
    ('wko_maria_2', 'cli_maria', 'rtn_001', 'Piernas y Glúteos', '2026-08-08', 52, 'Subió 2 kg en sentadilla sin problema.'),
    ('wko_maria_3', 'cli_maria', 'rtn_001', 'Piernas y Glúteos', '2026-08-15', 55, null),
    ('wko_maria_4', 'cli_maria', 'rtn_001', 'Piernas y Glúteos', '2026-08-22', 51, null),
    ('wko_maria_5', 'cli_maria', 'rtn_001', 'Piernas y Glúteos', '2026-08-29', 60, 'PR de sentadilla a 50 kg.'),
    ('wko_pedro_1', 'cli_pedro', 'rtn_003', 'Fuerza Superior',    '2026-07-20', 49, null),
    ('wko_pedro_2', 'cli_pedro', 'rtn_003', 'Fuerza Superior',    '2026-08-10', 45, null),
    ('wko_pedro_3', 'cli_pedro', 'rtn_003', 'Fuerza Superior',    '2026-08-27', 46, 'PR de press de banca a 67 kg.');

  insert into public.workout_exercise_logs (id, session_id, exercise_id, exercise_name, position) values
    ('wko_maria_1_squat', 'wko_maria_1', 'exc_squat',  'Sentadilla', 0),
    ('wko_maria_1_lunges','wko_maria_1', 'exc_lunges', 'Zancadas',   1),
    ('wko_maria_2_squat', 'wko_maria_2', 'exc_squat',  'Sentadilla', 0),
    ('wko_maria_2_lunges','wko_maria_2', 'exc_lunges', 'Zancadas',   1),
    ('wko_maria_3_squat', 'wko_maria_3', 'exc_squat',  'Sentadilla', 0),
    ('wko_maria_3_lunges','wko_maria_3', 'exc_lunges', 'Zancadas',   1),
    ('wko_maria_4_squat', 'wko_maria_4', 'exc_squat',  'Sentadilla', 0),
    ('wko_maria_4_lunges','wko_maria_4', 'exc_lunges', 'Zancadas',   1),
    ('wko_maria_5_squat', 'wko_maria_5', 'exc_squat',  'Sentadilla', 0),
    ('wko_maria_5_lunges','wko_maria_5', 'exc_lunges', 'Zancadas',   1),
    ('wko_pedro_1_bench', 'wko_pedro_1', 'exc_bench_press', 'Press de banca', 0),
    ('wko_pedro_1_row',   'wko_pedro_1', 'exc_barbell_row', 'Remo con barra', 1),
    ('wko_pedro_2_bench', 'wko_pedro_2', 'exc_bench_press', 'Press de banca', 0),
    ('wko_pedro_2_row',   'wko_pedro_2', 'exc_barbell_row', 'Remo con barra', 1),
    ('wko_pedro_3_bench', 'wko_pedro_3', 'exc_bench_press', 'Press de banca', 0),
    ('wko_pedro_3_row',   'wko_pedro_3', 'exc_barbell_row', 'Remo con barra', 1);

  -- Series: 4 iguales de sentadilla/press, 3 de zancadas, 4 de remo (helper del mock).
  insert into public.workout_set_logs (id, exercise_log_id, set_number, reps, weight_kg, rpe)
  select l.id || '_s' || g, l.id, g, s.reps, s.weight, s.rpe
  from (values
    -- María: squat reps 8 (rpe var), lunges reps 10
    ('wko_maria_1_squat', 4, 8, 40, 7),   ('wko_maria_1_lunges', 3, 10, 12, null),
    ('wko_maria_2_squat', 4, 8, 42, 7),   ('wko_maria_2_lunges', 3, 10, 12, null),
    ('wko_maria_3_squat', 4, 8, 45, 8),   ('wko_maria_3_lunges', 3, 10, 14, null),
    ('wko_maria_4_squat', 4, 8, 48, 8),   ('wko_maria_4_lunges', 3, 10, 14, null),
    ('wko_maria_5_squat', 4, 8, 50, 9),   ('wko_maria_5_lunges', 3, 10, 16, null),
    -- Pedro: bench reps var rpe 8, row reps 8
    ('wko_pedro_1_bench', 4, 6, 60, 8),   ('wko_pedro_1_row', 4, 8, 50, null),
    ('wko_pedro_2_bench', 4, 5, 62, 8),   ('wko_pedro_2_row', 4, 8, 52, null),
    ('wko_pedro_3_bench', 4, 5, 67, 8),   ('wko_pedro_3_row', 4, 8, 55, null)
  ) as s(log_id, set_count, reps, weight, rpe)
  join public.workout_exercise_logs l on l.id = s.log_id
  cross join lateral generate_series(1, s.set_count) as g;

  -- ---------------------------------------------------------------------
  -- Mensajería (MESSAGES_SEED — solo cli_luis). Fechas relativas a hoy.
  -- ---------------------------------------------------------------------
  insert into public.messages (id, client_id, sender, text, sent_at) values
    ('msg_luis_1', 'cli_luis', 'coach',  '¡Buen trabajo esta semana, Luis! Subiste el press de banca sin perder técnica. Mantén ese ritmo y descansa bien entre series.', now() - interval '3 days' + interval '9 hours' + interval '30 minutes'),
    ('msg_luis_2', 'cli_luis', 'client', 'Gracias! Me sentí fuerte. Una duda: ¿el jueves cambio el remo por dominadas?',                                              now() - interval '3 days' + interval '11 hours' + interval '5 minutes'),
    ('msg_luis_3', 'cli_luis', 'coach',  'Sí, perfecto. 4 series de dominadas, y si te sobran repes añade lastre poco a poco.',                                          now() - interval '2 days' + interval '9 hours' + interval '15 minutes');
end $$;

-- ---------------------------------------------------------------------------
-- Enlace del usuario de cliente con su ficha (para que la RLS de rol 'client'
-- funcione). Descomentar tras crear el usuario en el dashboard de Supabase
-- con user_metadata { "role": "client", "client_id": "cli_luis" }.
-- ---------------------------------------------------------------------------
-- update public.clients
--   set client_user_id = (select id from auth.users where email = 'cliente@navyteam.com')
--   where id = 'cli_luis';
