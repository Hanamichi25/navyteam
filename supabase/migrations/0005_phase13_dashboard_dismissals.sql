-- Fase 13 — El entrenador puede ocultar entradas del panel.
--
-- "Actividad reciente" y "Logros de la semana" son derivados; ocultar una
-- entrada = guardar un descarte por `item_key` (el id estable de la entrada) y
-- filtrarlo al construir el DashboardData.

create table public.dashboard_dismissals (
  coach_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  item_key     text not null,
  dismissed_at timestamptz not null default now(),
  primary key (coach_id, item_key)
);

alter table public.dashboard_dismissals enable row level security;

create policy dashboard_dismissals_self on public.dashboard_dismissals
  for all to authenticated
  using (coach_id = auth.uid())
  with check (coach_id = auth.uid());

grant select, insert, delete on public.dashboard_dismissals to authenticated;
