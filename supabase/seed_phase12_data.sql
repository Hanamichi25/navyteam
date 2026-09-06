-- Fase 12 — data aditiva (alimentos + comidas de ejemplo), SIN borrar nada.
--
-- Para proyectos que ya tienen data y solo necesitan poblar el catálogo de
-- alimentos y unas comidas de demo tras aplicar la migración 0004.
-- Pegar en el SQL Editor. `supabase/seed.sql` (completo) ya incluye esto.

do $$
declare coach uuid;
begin
  select id into coach from auth.users where email = 'entrenador@navyteam.com';
  if coach is null then raise exception 'No existe entrenador@navyteam.com'; end if;

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
    ('fd_brocoli',      coach, 'Brócoli',               'g',      100, 34,  2.8, 7,   0.4)
  on conflict (id) do nothing;

  -- Comidas de ejemplo en nut_001 (déficit) y nut_002 (volumen).
  insert into public.nutrition_meals (id, plan_id, name, position) values
    ('meal_n1_1', 'nut_001', 'Desayuno', 0),
    ('meal_n1_2', 'nut_001', 'Almuerzo', 1),
    ('meal_n1_3', 'nut_001', 'Cena',     2),
    ('meal_n2_1', 'nut_002', 'Desayuno', 0),
    ('meal_n2_2', 'nut_002', 'Almuerzo', 1),
    ('meal_n2_3', 'nut_002', 'Merienda', 2),
    ('meal_n2_4', 'nut_002', 'Cena',     3)
  on conflict (id) do nothing;

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
    ('mi_n2_4b', 'meal_n2_4', 'fd_pasta',        'Pasta cocida',          150, 1)
  on conflict (id) do nothing;
end $$;
