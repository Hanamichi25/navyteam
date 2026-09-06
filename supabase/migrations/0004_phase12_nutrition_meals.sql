-- Fase 12 — Comidas y alimentos en los planes de alimentación.
--
-- Un plan pasa de "solo objetivo" (kcal + macros % a mano) a armarse por
-- comidas con alimentos del catálogo; las kcal/macros se calculan de ahí.

-- ===========================================================================
-- foods — catálogo de alimentos del coach (mismo patrón que exercises)
-- ===========================================================================

create table public.foods (
  id           text primary key,
  coach_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name         text not null,
  unit         text not null check (unit in ('g','ml','unidad')),
  ref_quantity numeric not null,
  kcal         numeric not null,
  protein_g    numeric not null default 0,
  carbs_g      numeric not null default 0,
  fat_g        numeric not null default 0,
  created_at   timestamptz not null default now()
);
create index foods_coach_id_idx on public.foods (coach_id);

alter table public.foods enable row level security;

create policy foods_coach_all on public.foods
  for all to authenticated
  using (coach_id = auth.uid())
  with check (coach_id = auth.uid());

create policy foods_client_read on public.foods
  for select to authenticated
  using (coach_id in (
    select c.coach_id from public.clients c where c.client_user_id = auth.uid()
  ));

-- ===========================================================================
-- nutrition_plans — objetivo opcional; se quitan kcal/macros manuales
-- ===========================================================================

alter table public.nutrition_plans add column target_kcal_per_day numeric;
update public.nutrition_plans set target_kcal_per_day = nullif(kcal_per_day, 0);
alter table public.nutrition_plans drop column kcal_per_day;
alter table public.nutrition_plans drop column protein_pct;
alter table public.nutrition_plans drop column carbs_pct;
alter table public.nutrition_plans drop column fat_pct;

-- ===========================================================================
-- nutrition_meals / nutrition_meal_items
-- ===========================================================================

create table public.nutrition_meals (
  id       text primary key,
  plan_id  text not null references public.nutrition_plans (id) on delete cascade,
  name     text not null,
  position integer not null default 0
);
create index nutrition_meals_plan_id_idx on public.nutrition_meals (plan_id);

create table public.nutrition_meal_items (
  id        text primary key,
  meal_id   text not null references public.nutrition_meals (id) on delete cascade,
  food_id   text not null references public.foods (id) on delete restrict,
  food_name text not null,
  quantity  numeric not null,
  position  integer not null default 0
);
create index nutrition_meal_items_meal_id_idx on public.nutrition_meal_items (meal_id);
create index nutrition_meal_items_food_id_idx on public.nutrition_meal_items (food_id);

alter table public.nutrition_meals      enable row level security;
alter table public.nutrition_meal_items enable row level security;

-- --- nutrition_meals ----------------------------------------------------
create policy nutrition_meals_coach_all on public.nutrition_meals
  for all to authenticated
  using (exists (
    select 1 from public.nutrition_plans p
    where p.id = nutrition_meals.plan_id and p.coach_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.nutrition_plans p
    where p.id = nutrition_meals.plan_id and p.coach_id = auth.uid()
  ));

create policy nutrition_meals_client_read on public.nutrition_meals
  for select to authenticated
  using (nutrition_meals.plan_id in (
    select c.nutrition_plan_id from public.clients c where c.client_user_id = auth.uid()
  ));

-- --- nutrition_meal_items ---------------------------------------------
create policy nutrition_meal_items_coach_all on public.nutrition_meal_items
  for all to authenticated
  using (exists (
    select 1
    from public.nutrition_meals m
    join public.nutrition_plans p on p.id = m.plan_id
    where m.id = nutrition_meal_items.meal_id and p.coach_id = auth.uid()
  ))
  with check (exists (
    select 1
    from public.nutrition_meals m
    join public.nutrition_plans p on p.id = m.plan_id
    where m.id = nutrition_meal_items.meal_id and p.coach_id = auth.uid()
  ));

create policy nutrition_meal_items_client_read on public.nutrition_meal_items
  for select to authenticated
  using (exists (
    select 1
    from public.nutrition_meals m
    where m.id = nutrition_meal_items.meal_id
      and m.plan_id in (
        select c.nutrition_plan_id from public.clients c where c.client_user_id = auth.uid()
      )
  ));

grant select, insert, update, delete on public.foods              to authenticated;
grant select, insert, update, delete on public.nutrition_meals    to authenticated;
grant select, insert, update, delete on public.nutrition_meal_items to authenticated;
