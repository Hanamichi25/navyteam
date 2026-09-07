# AGENTS.md

Este archivo guía a Claude Code (y a cualquier agente) al trabajar en este repositorio.
`CLAUDE.md` lo incluye vía `@AGENTS.md`.

## Contexto del proyecto

App fitness en **React Native + Expo (managed workflow) + TypeScript strict**. El objetivo
final es una app con rutinas, nutrición y gestión de usuarios/clientes para entrenadores.

Documentos de referencia (leer antes de generar código si aplica a la tarea):
- `docs/App_Fitness_RN_Expo_Especificaciones.md` — arquitectura completa, stack, seguridad, autenticación real.
- `docs/Analisis_Recomendaciones_Apps_Fitness.md` — investigación de usuarios que origina las decisiones de producto.
- Mockups de pantallas en `resources/`:
  - `navyteam-login.png`, `navyteam-dashboard.png` — Fase 1 (hechas)
  - `navyteam-menu.png` — menú lateral (Drawer)
  - `navyteam-usuarios.png` — "Mis Usuarios" (lista de clientes)
  - `navyteam-perfil-usuario.png` — perfil de un cliente
  - `navyteam-rutinas.png` — catálogo de rutinas
  - `navyteam-alimentacion.png` — planes de alimentación
  - **Los mockups son la fuente de verdad del diseño. Revisarlos antes de construir cada pantalla.**

---

## ⚠️ Estado actual — Supabase-only (decidido 2026-09-06)

**Ya no hay capa mock.** Toda la data va contra Supabase. Los `*Gateway.mock.ts` y los
`*.mock.ts` de datos semilla **se borraron**; `src/gateways/index.tsx` y `app/_layout.tsx`
inyectan siempre la implementación Supabase. `.env` (`EXPO_PUBLIC_SUPABASE_URL` +
`EXPO_PUBLIC_SUPABASE_ANON_KEY`) es **obligatorio** — `src/lib/supabase.ts` lanza si falta.

**Sin datos de demo — solo clientes reales.** El seed (`supabase/seed.sql`) siembra únicamente
los **catálogos del coach** (11 ejercicios, 6 rutinas, 4 planes, 24 alimentos). **No** se
siembran clientes: los da de alta el entrenador desde la app, y cada uno recibe un email de
invitación para crear su contraseña (Fase 11). `supabase/seed.sql` conserva bloques de clientes
demo comentados/históricos, pero **no se ejecutan** — si aparece uno, es error.

### Estado del proyecto Supabase real (`oqgknkxnmhzmxlntckck`) — verificado 2026-09-07

- **Migraciones `0001`–`0006`: TODAS aplicadas** (`npx supabase migration list` → Local = Remote).
- **Edge Functions `invite-client` / `delete-client` / `send-push`: desplegadas y ACTIVE.**
- **Secrets configurados:** `PUSH_HOOK_SECRET`, y las que inyecta la plataforma
  (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, …). Fila `app_config` (`edge_url`, `push_secret`)
  **presente** → el push se dispara desde los triggers.
- **Catálogos sembrados** (ejercicios 11, rutinas 6, planes 4, foods 24). **0 clientes** (correcto).
- **Usuarios de Auth:** solo `entrenador@navyteam.com` (`role: coach`). No hay usuario cliente de
  prueba y no debe crearse uno — los clientes entran por el flujo de invitación.

**Lo que falta para el flujo de invitación (Fase 11):**
1. **`INVITE_REDIRECT_URL`** (secret) — no está configurado. Debe ser `https://<host-web>/set-password`
   (el deploy de EAS Hosting). `npx supabase secrets set INVITE_REDIRECT_URL=https://<host>/set-password`.
2. **Allowlist de redirect**: Dashboard → Auth → URL Configuration → añadir
   `https://<host>/set-password` y `https://<host>/**`.
3. **Email template** "Invite user" → copy en español (opcional).
4. Verificar que `PUSH_HOOK_SECRET` (secret de la función) == `app_config.push_secret` (no se pudo
   comparar, ambos llegan como digest) — solo relevante al probar el push real.

El histórico por fases de abajo conserva su redacción original ("con mocks", "AsyncStorage",
etc.) como registro de cómo se construyó cada cosa; la implementación viva es la de Supabase.

---

## Estado histórico (Fases 1 y 2 — COMPLETADAS)

La app se construyó primero hasta UI completa con **datos mock**, y la Fase 1
está **desplegada en EAS Hosting (web)**.

**Qué existe:**
- **Todas las pantallas de los mockups** de `resources/`: Login, Dashboard, Menú lateral,
  Mis Usuarios, Perfil de Usuario, Rutinas, Planes de Alimentación, Perfil (entrenador, provisional).
- **Navegación real** con Expo Router: `app/index.tsx` (redirect según sesión) → `app/(auth)/login`
  o `app/(app)/` (Drawer + Tabs de 5 secciones). Guards de sesión en `(auth)/` y `(app)/`.
- Estado de sesión en memoria con Zustand (`src/features/auth/store/authStore.ts`).
- **Toda la data es mock local** (`*.mock.ts` con delay artificial y caso de error), cargada
  con `src/lib/useAsyncData.ts` (máquina `loading | ready | error`).
- Features de dominio: `auth`, `dashboard`, `clients`, `routines`, `nutrition`, `exercises`,
  `workouts`, `messages` — cada una con
  `index.ts` como API pública.
- Estilos con **NativeWind v4** (tema en `tailwind.config.js`: `primary`, `ink`, `surface`, `line`).
- Formularios con React Hook Form + Zod.

**Credenciales mock** (`src/features/auth/mocks/users.mock.ts`):
- Entrenador: `entrenador@fitcoach.com` / `navyteam123` · `lucia@navyteam.com` / `coach2026`
- Cliente (Fase 8): `cliente@navyteam.com` / `cliente2026` (ligado a `cli_luis`)

**Deploy:**
- Proyecto EAS: `drmartinn25/navyteam` (`projectId` en `app.json`).
- Dashboard de hosting: https://expo.dev/accounts/drmartinn25/projects/navyteam/hosting
- `npm run deploy` → preview | `npm run deploy -- --prod` → producción.

---

## Fase 2 — Pantallas restantes, con mocks (COMPLETADA)

Toda la UI de los mockups está construida con datos mock y navegación real. Detalle:

- **Navegación**: `app/(app)/_layout.tsx` = Drawer (`AppDrawerContent`) que envuelve
  `app/(app)/(tabs)/_layout.tsx` = Tabs de 5 secciones. Perfil de cliente = Stack anidado
  en la tab Usuarios (`clients/_layout.tsx`). Guard de sesión en `(app)/_layout.tsx`.
  - ⚠️ Expo SDK 56+ prohíbe importar `@react-navigation/native`. Para abrir el Drawer se usa
    `src/lib/openDrawer.ts` (despacha `{ type: 'OPEN_DRAWER' }`), **no** `DrawerActions`.
- **Pantallas** ↔ features: Menú lateral (`AppDrawerContent`), Mis Usuarios + Perfil de Usuario
  (`clients`), Rutinas (`routines`), Planes de Alimentación (`nutrition`), Perfil entrenador
  (`(tabs)/profile.tsx`, provisional).
- Placeholders del Drawer: `(app)/{stats,settings,support}.tsx` → componente `ComingSoon`
  (`messages.tsx` ya es real, ver feature `messages`).
- UI compartida en `src/components/`: `Avatar`, `Badge`, `ChipGroup`, `Fab`, `FeedbackState`,
  `ListRow`, `MacroBar`, `MetricTile`, `ProgressBar`, `ScreenHeader`, `SearchField`, `ComingSoon`, `AppDrawerContent`.
- Helpers en `src/lib/`: `delay`, `useAsyncData`, `openDrawer`.

### Deuda técnica / pulido pendiente

- Los FAB `+` y el botón de filtro "⋯" del header son placeholders con `// TODO(backend)`
  → los formularios de alta/edición son **Fase 5**.
- Imágenes de tarjetas de **nutrición**: `https://picsum.photos/seed/...` en la data mock
  (`expo-image` no se instaló). Las de **rutina** ya no: `routineBanner(id)` sirve una de
  `src/assets/routines/*.jpg` (banners del usuario optimizados). `Routine.imageUrl` se conserva
  para portadas subidas en la Fase 10.
- **El dashboard (`(tabs)/dashboard.tsx`) tiene el rediseño visual aplicado pero sigue con
  datos 100% mock** (`DashboardGateway` mock + `dashboardData.mock.ts`): banner de próxima
  sesión, "Resumen" con toggle Semana/Mes y deltas, **"Logros de la semana"** (PRs de carga/1RM/
  volumen + rachas de los clientes; fila → progreso del ejercicio o perfil), "Hoy" con filas
  expandibles y feed de "Actividad reciente" con filtro por tipo. Las métricas por periodo, los
  logros, el feed y las sesiones **no derivan de datos reales** — el swap a `clients` +
  `workouts` queda para la Fase 10 (`weeklyAchievements` saldría de comparar los PRs de
  `progress.ts` con la fecha de cada récord). Guía visual: canvas de Claude Design
  (`https://claude.ai/code/artifact/9d4e9de6-0c1a-47e9-859a-02af918f3eda`, artboard "Rediseño").
  Los 3 accesos rápidos "Nuevo cliente/rutina/plan" **se quitaron** (redundantes con los FAB `+`
  de las tabs Usuarios/Rutinas/Alimentación).
- El tab "Alimentación" puede recortarse en pantallas < 390 px de ancho (ancho de la
  etiqueta, sigue pendiente). **Corregido en cambio**: el recorte vertical de las
  etiquetas de los 5 tabs (se veían cortadas a la mitad o directamente invisibles) —
  causa: `tabBarStyle` no tenía `height` explícito, y el item de cada tab es un
  flex-column donde el ícono tiene `flexShrink: 0`; sin margen de sobra, todo el
  apriete lo absorbía la etiqueta hasta aplastarla a 2-3px. Fix en
  `app/(app)/(tabs)/_layout.tsx`: `tabBarStyle.height` explícito (76 + inset inferior
  vía `useSafeAreaInsets`) con paddings generosos.

---

## Reordenamiento del roadmap (decidido)

El **backend real de auth se movió al final** (antes Fase 3, ahora Fase 9). Con el patrón
Gateway, cada módulo habla con una interfaz; da igual si detrás hay un mock o un backend real,
así que conviene construir toda la funcionalidad con mocks primero y hacer el swap de backend
casi al final.

**La vista de cliente entra en el plan (2026-09-02).** Antes estaba en "Futuro"; ahora es la
**Fase 8** (con mocks, antes del backend). Decisiones:
- **Misma app, rutas por rol** (no una 2ª app): `User.role: 'coach' | 'client'`. Al iniciar
  sesión, `app/index.tsx` enruta a la experiencia de entrenador (Drawer + Tabs actual) o a la
  de cliente (shell propio, más simple). Reutiliza features, tipos y Gateways. La extracción a
  app aparte sigue siendo parte del futuro monorepo.
- **El cliente registra sus propias series (reps/pesos)** desde su vista. El entrenador lo
  sigue pudiendo hacer desde el panel (Fase 7). Ambos escriben `WorkoutSession` con `clientId`
  → el mismo `WorkoutsGateway`, la misma forma de datos.
- El cliente **ve** (solo lectura) su rutina asignada y su plan de alimentación asignado.
- Cross-user real (lo que registra el cliente aparece en el panel del entrenador en otro
  dispositivo) **no** funciona con los mocks de AsyncStorage — eso llega con datos reales
  (Fase 10). Con mocks se demuestra en un mismo dispositivo cambiando de sesión.

**Decisiones tomadas para las fases de CRUD:**
- Los **planes de alimentación son solo objetivo**: kcal/día + macros (P/C/G) + notas de texto
  libre. Sin catálogo de alimentos.
- Los **Gateways mock persisten en el dispositivo** con `@react-native-async-storage/async-storage`
  (seed inicial desde los `*.mock.ts` actuales). Así el flujo de seguimiento se puede probar de
  verdad sin backend. Se descartan al conectar el backend real.

---

## Fase 3 — Capa de datos y edición (COMPLETADA)

Infraestructura común para todos los CRUD siguientes. **Sin backend real.**

**Qué se hizo:**
1. **Patrón Gateway** en `clients`, `routines`, `nutrition` (CRUD completo) y `dashboard`
   (solo lectura): `src/features/<x>/gateway.ts` con la interfaz.
2. **Implementación mock persistente**: `src/features/<x>/mocks/<x>Gateway.mock.ts` sobre
   **AsyncStorage** (`src/lib/storage.ts`: `readJSON`/`writeJSON`), sembrada desde los
   `*.mock.ts` de datos (ahora solo exportan el array semilla, p.ej. `CLIENT_DETAILS_SEED`).
   Simula latencia y conserva los casos de error existentes. `src/lib/id.ts` genera ids nuevos.
3. **Inyección de Gateways**: `src/gateways/index.tsx` (`GatewaysProvider` + un hook por
   feature, ej. `useClientsGateway`), un único contexto agregado montado en `app/_layout.tsx`.
4. **`@tanstack/react-query`**: `QueryClientProvider` en `app/_layout.tsx`. Lecturas → `useQuery`,
   mutaciones → `useMutation` + `invalidateQueries`. `src/lib/useAsyncData.ts` se eliminó; su tipo
   `AsyncState<T>` vive ahora en `src/lib/queryState.ts` junto a `toAsyncState()`, un adaptador de
   `useQuery` a esa misma forma — así las pantallas de lectura no cambiaron.
   - `create()` en `clients`/`nutrition` rellena con placeholders los campos que aún no tiene
     formulario propio (medidas del cliente, imagen del plan) — los editores reales de las
     Fases 5-6 los reemplazan.
5. **Campos reutilizables** en `src/components/`: `TextField`, `SelectField`, `NumberField`,
   `DateField` (esta última con entrada de texto `dd/mm/aaaa`, sin date-picker nativo todavía).
   **Ejemplo end-to-end** del patrón crear/editar: `app/(app)/(tabs)/nutrition/new.tsx`
   ("Nuevo plan", modal sobre `nutrition/_layout.tsx`) — plantilla a copiar en las Fases 4-6.

---

## Fases 4–7 — CRUD y seguimiento (con mocks)

Cada una construye sobre la capa de la Fase 3. No hay mockups de los editores → diseñar con el
sistema visual actual (mismos tokens y componentes). Conectar el FAB `+` y el botón "⋯" de cada
pantalla a su formulario.

- ✅ **Fase 4 — Ejercicios + CRUD de Rutinas.** Nueva feature `exercises` (`src/features/exercises/`):
  catálogo (nombre, grupo muscular, equipo, descripción opcional) con su CRUD, seed de ~10
  ejercicios y filtro por grupo muscular (`MUSCLE_GROUP_FILTERS`); pantallas en `app/(app)/exercises/`,
  con entrada propia en el Drawer. `Routine` se dividió en resumen/detalle igual que `Client`:
  `RoutineDetail.blocks: RoutineBlock[]` (cada uno referencia un `Exercise` y define series, rango
  de reps, carga sugerida, descanso), `RoutinesGateway.get(id)` nuevo. Editor compartido
  `RoutineEditorForm` (`new.tsx`/`[id].tsx` en `app/(app)/(tabs)/routines/`): metadata + picker de
  ejercicios en un `<Modal>` + reordenar bloques con botones ↑/↓ (sin librería de drag-and-drop).
  **Rediseñado después de la Fase 13** — ver sección "Rediseño del editor de rutinas"
  (`RoutineSummaryCard`, `ExerciseBlockCard` colapsable, `ExercisePickerModal`).
  Asignar/desasignar rutina a un cliente se hace desde su perfil (tab Rutinas → "+ Asignar rutina"
  → elegir rutina + días) vía `ClientsGateway.assignRoutine`/`unassignRoutine`, que guardan un
  snapshot denormalizado en `ClientDetail.assignedRoutines` (no sincroniza `assignedCount` del
  catálogo — limitación conocida del mock, se resuelve con backend real en Fase 10).
  - **Bug encontrado y corregido de paso**: `Alert.alert` de React Native es un no-op en
    react-native-web (sin callbacks ni botones), así que ninguna confirmación —incluido el logout
    de `AppDrawerContent`, que ya lo usaba desde la Fase 2— funcionaba en la versión web. Se
    añadió `src/lib/confirm.ts` (usa `window.confirm` en web, `Alert.alert` en nativo) y se
    migraron los tres usos existentes.
- ✅ **Fase 5 — CRUD de Alimentación.** Mismo patrón que la Fase 4, aplicado a `nutrition`:
  formulario compartido `NutritionPlanForm` (`new.tsx`/`[id].tsx` en `app/(app)/(tabs)/nutrition/`)
  con nombre, categoría, kcal/día, macros que suman 100 y notas de texto libre (nuevo campo
  `NutritionPlan.notes?`); `[id].tsx` agrega el botón eliminar con `confirm()`. Asignar/desasignar
  plan a un cliente desde su perfil (tab Alimentación → "+ Asignar plan" → tocar un plan lo asigna
  al instante, sin paso de confirmar aparte, porque a diferencia de las rutinas un cliente tiene
  **como mucho un plan a la vez** y no lleva horario) vía `ClientsGateway.assignPlan`/`unassignPlan`.
  `ClientDetail.assignedPlanName: string | null` (un string suelto) se subió de nivel a
  `assignedPlan: AssignedNutritionPlan | null` ({id, name, kcalPerDay}), igual que ya existía
  `AssignedRoutine` para rutinas — así se puede desasignar por id en vez de por nombre.
- ✅ **Fase 6 — CRUD de Clientes + perfil ampliado.** Formulario compartido `ClientEditorForm`
  (`clients/new.tsx`/`[id]/edit.tsx`): nombre, objetivo, fecha de nacimiento, altura, meta de
  peso, email/teléfono/notas (opcionales). `avatarUrl` sigue el mismo precedente que `imageUrl`
  en `nutrition`/`routines`: lo genera el Gateway (placeholder `pravatar` aleatorio), no es un
  campo del formulario. El botón "⋯" del perfil navega al editor; "Eliminar usuario" vive en su
  footer con `confirm()`, igual que rutinas/planes.
  **El peso "actual" no se edita desde el formulario general** — es siempre la medición más
  reciente de `ClientDetail.measurements: BodyMeasurement[]` (fecha + peso + medidas opcionales:
  cintura/pecho/cadera/brazo). Se gestiona aparte, desde el perfil ("+ Agregar medición" →
  `clients/[id]/add-measurement.tsx`, modal) vía `ClientsGateway.addMeasurement`, que recalcula
  `weightKg`, `weightProgress.currentKg` y **`bmi`** (el IMC nunca se teclea, siempre se deriva
  de `heightCm` + el peso vigente — también se recalcula en `update()` si cambia la altura). El
  form de **crear** pide además un "Peso inicial" obligatorio que siembra `weightProgress.startKg`
  y la primera medición (encadenando `useCreateClient` + `useAddMeasurement` desde `new.tsx`); el
  form de **editar** no lo muestra. `ClientInput` dejó de ser `Omit<Client,'id'>` y pasó a ser su
  propia interfaz con estos campos.
  Perfil ampliado: **edad calculada** (`src/lib/date.ts#computeAge`, junto a "Miembro desde") sin
  tocar la fila de `MetricTile` para no repetir el bug de recorte por falta de espacio que se
  arregló en la tab bar (ver más abajo); **`WeightEvolutionChart`** (gráfica de línea con
  `react-native-gifted-charts`, ancho explícito vía `useWindowDimensions` en vez de
  `adjustToWidth` — evita que la línea se desborde de la card en el primer render) y
  **`MeasurementHistoryList`** (sin eliminar, scope acotado a propósito) debajo de
  `WeightProgressCard`; **"Adherencia"** es una card placeholder explícita — no hay datos reales
  de sesiones hasta la Fase 7.
  **Caveat conocido de `react-native-gifted-charts` en web**: emite 7 warnings de consola
  "Unknown event handler property... onStartShouldSetResponder/onResponderGrant/..." — la
  librería asigna siempre esos props (sistema de Responder heredado de React Native clásico) al
  `View` interno del `LineChart`, independientemente de si se usa `pointerConfig`, y
  react-native-web no los reconoce. Es ruido de consola solo en dev, no afecta el render ni la
  interacción — no se intentó suprimir (fragilidad de parchear una librería externa por un
  problema puramente cosmético).
- ✅ **Fase 7 — Registro de entrenamientos + seguimiento.** Nueva feature `workouts`
  (`src/features/workouts/`, mismo precedente que `exercises`): `WorkoutSession`
  (cliente + rutina + fecha + notas) → `ExerciseLog` por ejercicio → `SetLog` (nº serie, reps,
  peso, RPE opcional). Patrón Gateway + mock persistido en AsyncStorage (`@navyteam/workouts`,
  seed en `workouts.mock.ts`). La lógica de derivación vive en `src/features/workouts/progress.ts`
  (funciones puras, sin I/O): resumen de sesión, progreso por ejercicio, ejercicios entrenados,
  resumen de adherencia — el mock del gateway las llama y una implementación real las reusaría.
  **Flujo (lo hace el entrenador desde el perfil del cliente):** pestaña **"Entrenos"** →
  "+ Registrar sesión" (`clients/[id]/log-session.tsx`, modal) → `SessionLoggerForm` elige una
  rutina **asignada** al cliente, trae sus bloques vía `RoutinesGateway.get()` (el snapshot
  `AssignedRoutine` no los tiene) y prellena una grilla de series editable por ejercicio (reps =
  punto medio del rango de la rutina, peso = primer número de `suggestedLoad`) → guardar.
  Historial de sesiones + detalle de solo lectura con eliminar (`clients/[id]/session/[sessionId].tsx`).
  **Progreso por ejercicio** (`clients/[id]/progress/[exerciseId].tsx`): gráfica de 1RM estimado
  (fórmula de **Epley**, `react-native-gifted-charts` ya instalado), PRs de carga/volumen/1RM e
  historial. La card **"Adherencia"** del perfil pasa a ser `TrainingSummaryCard` con datos
  reales (sesiones del mes + racha de semanas + última sesión).
  **Decisiones:** (1) el **dashboard se deja para una fase posterior** — desde entonces se le
  aplicó el **rediseño visual** (ver "Deuda técnica"), pero la conexión a datos reales sigue aplazada;
  (2) adherencia = **resumen simple**, sin porcentaje (no hay agenda real de sesiones esperadas);
  (3) **pesos enteros** (mismo precedente que `BodyMeasurement.weightKg` y que `suggestedLoad`,
  que ya es texto libre). **Limitación conocida del mock:** si una rutina asignada fue eliminada
  del catálogo, `RoutinesGateway.get()` lanza y no se puede loguear contra ella (FK reales en Fase 10).

---

## Fase 8 — Vista de cliente (con mocks) — COMPLETADA

El **cliente** tiene su propia experiencia en la misma app (misma sesión mock, Gateways mock).

**Qué se hizo:**
1. **Rol en auth**: `User.role: 'coach' | 'client'` + `User.clientId?` (`src/types/auth.ts`).
   `users.mock.ts` gana un cliente demo: `cliente@navyteam.com` / `cliente2026`
   (`clientId: 'cli_luis'`) + `CLIENT_DEMO_CREDENTIALS`.
2. **Enrutado por rol**: `app/index.tsx`, `app/(auth)/_layout.tsx` y `LoginForm` mandan a
   `coach` → `/(app)/(tabs)/dashboard`, `client` → `/(client)/routine`.
   `app/(app)/_layout.tsx` rebota clientes a `/(client)/…`. **Nuevo grupo `app/(client)/`**
   (hermano de `(app)/`, NO anidado — evita tocar rutas del entrenador): `_layout.tsx` =
   guard de rol + Tabs de 4 (**Mi rutina · Alimentación · Mis entrenos · Cuenta**), sin Drawer.
3. **Mi rutina** (`(client)/routine.tsx`, solo lectura): rutinas asignadas + sus bloques, vía
   `AssignedRoutineView` (nuevo, en `routines`: resuelve `useRoutine` + `useExercises` y pinta
   `RoutineBlockList`, también nuevo).
4. **Mi alimentación** (`(client)/nutrition.tsx`, solo lectura): `NutritionPlanDetail` (nuevo,
   en `nutrition`: kcal + `MacroBar` + notas). El plan completo sale de `useNutritionPlans()`
   + find por `assignedPlan.id` (el `NutritionGateway` no tiene `get(id)`).
5. **Mis entrenos** (`(client)/workouts/`, Stack): historial (`SessionSummaryRow`) + "Registrar
   sesión" → `SessionLoggerForm` **reutilizado** con `clientId = user.clientId` (nuevo prop
   `emptyMessage` para el texto según rol) → `WorkoutsGateway.create()`. Detalle de sesión
   solo lectura vía `SessionDetailView` (nuevo, extraído de `session/[sessionId].tsx` del
   entrenador, que ahora también lo usa). **El cliente NO puede borrar sus sesiones.**
6. **Cuenta** (`(client)/account.tsx`): identidad + objetivo + "miembro desde" + cerrar sesión (con `confirm()`).
7. `useClient(id, enabled?)` gana el flag `enabled` (como `useRoutine`).

**Rediseño visual de las 4 pantallas** (después, misma fase). Guía: canvas de Claude Design
`https://claude.ai/code/artifact/f7760422-8d44-4edc-8d5c-741f74338aae` (artboard "Rediseño").
Cambios:
- **`DateStrip`** (`src/components/`): tira "Miércoles 2 · septiembre" en la cabecera de las 4 tabs.
  Helpers nuevos: `src/lib/date.ts#{weekdayIndexMonday,weekdayNameEs,todayLongLabel,WEEKDAY_LETTERS,WEEKDAYS_ES}`.
- **`src/lib/schedule.ts`** (nuevo): `parseSchedule`/`scheduleTrainsOn`/`nextTrainingWeekday` —
  parsea los horarios `"Lun/Mié/Vie"` de `AssignedRoutine.schedule` a índices lunes=0.
- **Mi rutina**: `TodayRoutineCard` ("Hoy te toca" — rutina del día o "Hoy descansas" +
  próximo entreno, ejercicios plegables) + `WeekScheduleStrip` (7 pills marcando días de
  entreno y hoy). Debajo, las rutinas asignadas en tarjetas plegables (`AssignedRoutineView`
  gana `hideHeader`). Ya no lista todo expandido de entrada.
- **Alimentación**: `NutritionPlanDetail` reescrito — card grande de kcal, macros en **gramos**
  (derivados de kcal + %) además del %, y notas.
- **Mis entrenos**: `TrainingSummaryCard` reutilizado (nuevos props `title`/`emptyHint`) arriba
  del historial; botón "Registrar sesión" → `Fab` (`+`).

**Verificado en la app** (Expo web): login de cliente → 4 tabs con el rediseño; "Hoy te toca"
resuelve la rutina del día; "Ver ejercicios" despliega; registrar sesión persiste y aparece en
el historial y en "Tu constancia"; login de entrenador sigue yendo al panel; el entrenador ve
en el perfil de Luis la sesión que registró el cliente.

### Entreno en curso + rediseño de "Mis entrenos" (después, misma fase)

Guía: canvas de Claude Design `https://claude.ai/code/artifact/3ad0d2e6-9dba-44c2-b17f-40297a30a67d`.

- **`WorkoutSession.durationMin?`** (+ `WorkoutSessionInput`, `WorkoutSessionSummary`): duración
  en minutos, entera y opcional. `summarizeSession`/`create()` la propagan; el seed de
  `workouts.mock.ts` la trae en todas las sesiones. `SessionDetailView` y `SessionSummaryRow`
  la muestran (`· 47 min`) cuando existe.
- **`useStopwatch`** (`src/features/workouts/hooks/`): cronómetro con marcas de tiempo reales
  (`Date.now()`, no suma de ticks) — `{ elapsedSec, running, toggle }` + `formatStopwatch()`.
- **`src/features/workouts/logging.ts`** (nuevo): helpers puros extraídos de `SessionLoggerForm`
  (`DraftSet`/`DraftExercise`, `draftsFromBlocks`, `toInputExercises`, `newSet`,
  `parseLeadingWeight`) — ahora compartidos con `ActiveSessionForm`. `SetRow` exporta `SetCell`
  y `toNumber`.
- **`ActiveSessionForm`** + ruta `app/(client)/workouts/start.tsx` (modal, `gestureEnabled:false`,
  `?routineId=`): entreno en curso. Cabecera con cronómetro (corre solo, se puede pausar),
  barra de "series completadas", un card por ejercicio con objetivo y grilla editable
  (`ActiveSetRow`: reps · kg · ✓ visual), "+ Serie". "Finalizar" → `create()` con
  `durationMin = round(elapsedSec/60)` y `date = hoy`. "Salir" pide `confirm()`.
- **`TodayRoutineCard`** gana `onStartWorkout?(routineId)` → botón sólido "▶ Iniciar entreno"
  (uno por rutina de hoy); "Ver ejercicios" pasa a link de texto. `(client)/routine.tsx` pasa
  la navegación a `/(client)/workouts/start`.
- **Rediseño de `TrainingSummaryCard`**: 3 cifras equilibradas con divisores + fecha corta
  (`monthDayShort` → "2 sep"); nuevo prop `weekSessions?` → tira de la semana (días entrenados,
  vía `weekdaysTrainedThisWeek` en `progress.ts`). Solo la usa la vista de cliente.
- **`SessionSummaryRow`** gana `leadingDateBadge?` (badge mes/día a la izquierda) — lo usa
  `(client)/workouts/index.tsx`; la vista del entrenador queda igual.
- **El FAB `+` de "Mis entrenos" sigue** abriendo `SessionLoggerForm` (registro manual de una
  sesión ya hecha, con fecha); "Iniciar" es para entrenar en el momento con cronómetro.

**Verificado** (Expo web): login cliente → "Iniciar entreno" abre el entreno en curso; el
cronómetro avanza y se pausa; marcar series mueve la barra; "Finalizar" guarda la sesión con su
duración y vuelve a "Mis entrenos" rediseñado (constancia equilibrada + tira de semana + badge
de fecha + `· N min`). `typecheck` y `export:web` en verde.

**Límite conocido del mock:** con AsyncStorage la data es local al dispositivo → "cliente
registra → entrenador lo ve" solo se demuestra en un mismo dispositivo cambiando de sesión.
El cross-user real llega con la Fase 10. La sesión mock **no se persiste** entre recargas
(sigue en memoria hasta la Fase 9), así que un deep-link directo a `/(client)/…` o `/(app)/…`
sin sesión cae al login — esperado.

**No se hizo (fuera de alcance):** chat, notificaciones, que el cliente edite rutinas/planes
o borre sesiones, onboarding de cliente, mediciones por el cliente, progreso por ejercicio en
la vista de cliente.

---

## Pulido pre-Fase 9 (con mocks) — COMPLETADO

Tres mejoras de producto pedidas antes de arrancar el backend. Todo mock, mismo patrón.

1. **Mensajería entrenador↔cliente** — feature nueva `src/features/messages/` (Gateway + mock
   AsyncStorage `@navyteam/messages`, un hilo por cliente, seed con `cli_luis`).
   `MessageThread` = hilo compartido (burbujas + compositor), lo montan el entrenador
   (`clients/[id]/messages`, y lista de hilos en el Drawer `(app)/messages.tsx`) y el cliente
   (`(client)/messages`, pantalla oculta `href:null`). `CoachMessageCard` = tarjeta del home
   del cliente con el último feedback. El `coachThreads()` del Gateway devuelve solo `clientId`
   + último mensaje; el nombre/avatar los cruza la pantalla con `useClients()` (el Gateway de
   mensajería no conoce el dominio de clientes). Límite: AsyncStorage es local → cross-device
   real en Fase 10.
2. **Home del cliente** — la tab `routine` pasa a titularse **"Inicio"** (icono `home`): saludo
   + `CoachMessageCard` arriba de `TodayRoutineCard` / "Tu semana" / lista de rutinas. El botón
   "Enviar Feedback" del perfil del cliente (entrenador) pasa a "Escribir mensaje".
3. **Portadas de rutina** — `src/assets/routines/*.jpg` (4 banners del usuario, optimizados a
   ~1080 px con `@expo/image-utils`). `routineBanner(id)` (en `routineImages.ts`) elige una por
   hash del id; `RoutineCard` la usa (`style={{ height: 128 }}` explícito: un `<Image>` con
   `source` estático y solo `w-full` toma su alto intrínseco en web). Originales en
   `resources/banners/`.
4. **Suscripción por cliente** (adelanto de la Fase 11) — `ClientDetail.monthlyFeeEur` +
   `payments: Payment[]`; `Client` hereda `subscriptionUntil`. `SubscriptionStatus`
   (`active|expiring|expired|none`, `expiring` = ≤7 días) se deriva en
   `src/features/clients/subscription.ts` (funciones puras). `ClientsGateway.registerPayment()`
   añade el pago y extiende `subscriptionUntil` N meses desde hoy o desde la vigencia vigente.
   `normalizeClient()` migra los clientes ya en localStorage. UI: `SubscriptionCard` en el
   perfil + modal `clients/[id]/register-payment` (fecha, importe prellenado, 1/3/6/12 meses,
   preview de nueva vigencia); campo "Cuota mensual" en `ClientEditorForm`; badge de aviso en
   `ClientListItem` para vencida/por vencer; estado en la Cuenta del cliente (solo lectura).

---

## Fase 9 — Backend real de autenticación (multi-rol) — COMPLETADA

Se sustituyó el mock de auth por **Supabase Auth** (ver "Decisión de backend"), manteniendo
intacta la interfaz que consume la UI. Dos roles: entrenador y cliente.

**Qué se hizo:**
1. `src/features/auth/gateway.ts` → interfaz `AuthGateway` (`signIn`, `signOut`, `getSession`,
   `refresh`). El mock original (`authService.mock.ts`) se reescribió como
   `mocks/authGateway.mock.ts` (`createMockAuthGateway`), implementando la interfaz completa
   con persistencia simulada — **se conserva** como implementación de referencia para tests y
   desarrollo offline (no se borra, mismo criterio que el resto de mocks). La implementación
   real, `supabase/authGateway.supabase.ts` (`createSupabaseAuthGateway`), se inyecta desde
   `app/_layout.tsx` vía `configureAuthGateway()` — elige Supabase si `EXPO_PUBLIC_SUPABASE_URL`
   está presente (`.env`, ver `.env.example`), si no cae al mock.
2. **Rol y `clientId`** viven en `user_metadata` de Supabase Auth (`role`, `name`, `avatar_url`,
   `client_id`) — se editan a mano desde el dashboard de Supabase o por SQL
   (`update auth.users set raw_user_meta_data = '{...}'::jsonb where id = '...'`) hasta que la
   Fase 10 traiga un flujo de alta propio. `supabaseAuthGateway` lanza si a un usuario le falta
   `role` o tiene uno inválido — un usuario de Supabase sin metadata configurada no puede operar
   la app, error explícito en vez de fallo silencioso.
3. `authStore` (`src/features/auth/store/authStore.ts`) recibe el `AuthGateway` por inyección
   (`configureAuthGateway`, módulo-level, llamado una vez desde `app/_layout.tsx`) — no lo
   importa directamente. Nuevo estado `restoring: boolean` (`true` hasta que `restore()` — que
   llama a `getSession()` — resuelve) para diferenciar "todavía no sé si hay sesión" de "no hay
   sesión"; `RootLayout` no monta el `<Stack>` de navegación hasta `restoring === false`, así los
   guards de rol de `(auth)/_layout.tsx`, `(app)/_layout.tsx`, `(client)/_layout.tsx` y
   `app/index.tsx` (que solo miran `user`) nunca ven un falso "no autenticado" en pleno arranque.
4. **Persistencia de sesión**: `src/lib/secureStorage.ts` (nuevo) — wrapper que usa
   `expo-secure-store` en nativo (iOS Keychain / Android Keystore) y, en web, **`sessionStorage`**
   (ver "Endurecimiento de sesión" más abajo; era `localStorage` hasta 2026-09-06). `expo-secure-store`
   **no tiene implementación web** (`ExpoSecureStore.default.getValueWithKeyAsync is not a function`
   en vez de fallar de forma legible — se descubrió probando el login real con Playwright). Mismo
   precedente que `src/lib/confirm.ts` (rama por `Platform.OS`). Lo usa `src/lib/supabase.ts`
   (`createClient(..., { auth: { storage: secureStorage } })`).
5. **Refresh de sesión**: `supabase-js` lo maneja internamente (`autoRefreshToken: true`);
   `AuthGateway.refresh()` expone `supabase.auth.refreshSession()` para el caso en que la UI
   necesite forzarlo.

**Verificado con Playwright (Expo web) contra un proyecto Supabase real:** login de un usuario
`role:'coach'` → dashboard del panel con su nombre real; reload de página → sesión persiste (no
vuelve a login); "Cerrar Sesión" desde el Drawer → limpia sesión, reload posterior se queda en
`/login`. Mismo flujo repetido con un usuario `role:'client', client_id:'cli_luis'` → enruta a
`/(client)/routine` con los datos reales de ese cliente (rutina asignada, mensaje del
entrenador), persiste tras reload. `typecheck` y `export:web` en verde.

### Endurecimiento de sesión (2026-09-06)

Auditoría de seguridad pedida por el usuario. Estado y cambios:

- **RLS**: ya activa en **las 20 tablas** `public` (verificado con un probe `anon` → 0 filas en
  todas). Nada que activar.
- **Cierre server-side**: `signOut()` pasa a `signOut({ scope: 'global' })` explícito — revoca
  **todos** los refresh tokens del usuario en el servidor (verificado: tras `logout` el refresh
  token vigente da 400). La rotación de refresh token ya estaba activa.
- **`SessionGuard`** (`src/features/auth/components/SessionGuard.tsx`, montado en `app/_layout.tsx`):
  - `AuthGateway.onSessionEnd()` → `supabase.auth.onAuthStateChange` escucha `SIGNED_OUT`
    (token caducado/revocado, logout en otra pestaña) → `authStore.endSession()` (limpieza local;
    el servidor ya invalidó). `logout()` = cierre iniciado por el usuario (revoca + limpia).
  - **Timeout por inactividad** `IDLE_TIMEOUT_MS = 30 min`: web con eventos reales
    (`pointerdown`/`keydown`/`wheel`/`touchstart`); nativo comprobando el tiempo en 2.º plano al
    volver a `active` (sin listener global de toques).
- **Token en `sessionStorage`** (web): la clave `sb-<ref>-auth-token` (access + refresh) muere al
  cerrar la pestaña y **no se escribe a disco**. Coste: re-login por pestaña / reinicio del
  navegador. Volver a `localStorage` = una línea en `secureStorage.ts`.

**Pendiente (hosting, no en código):** CSP + `X-Frame-Options: DENY` + `X-Content-Type-Options:
nosniff` como cabeceras reales en EAS Hosting. `web.output` es `single` → `app/+html.tsx` no
aplica; el `index.html` generado no tiene `<script>` inline, así que un `script-src 'self'` es
viable (probar antes con `Content-Security-Policy-Report-Only`). CSP sugerida:
`default-src 'self'; object-src 'none'; base-uri 'self'; img-src 'self' data: blob: https:;
font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self';
connect-src 'self' https://<ref>.supabase.co wss://<ref>.supabase.co https://exp.host`.
También en el dashboard de Supabase → Auth: bajar el "JWT expiry" y activar el "inactivity timeout".

**No se hizo (fuera de alcance, sin pedirse):** registro self-service, recuperación de
contraseña, biometría, OAuth social (los botones Google/Apple del login siguen siendo
`// TODO(backend)`). Alta de usuarios: sigue siendo manual desde el dashboard de Supabase — un
flujo propio (el entrenador da de alta un cliente y esto crea su usuario) es Fase 10.

---

## Fase 10 — Conectar todos los Gateways a Supabase — COMPLETADA (migración aplicada + RLS verificada por rol)

Cada `*Gateway` mock tiene ahora su gemelo real sobre Supabase (Postgres + RLS), sin tocar las
interfaces `Gateway` ni los hooks de React Query. Los mocks se conservan como implementación de
referencia (offline / tests), igual que `authGateway.mock.ts`.

**Qué se hizo:**
1. **Supabase CLI** (`supabase` devDependency, `npx supabase init`). Esquema en
   `supabase/migrations/0001_phase10_schema.sql`; semilla en `supabase/seed.sql` (porta los
   `*.mock.ts` 1:1, resolviendo el `coach_id` por el email `entrenador@navyteam.com`).
2. **Esquema `public`** (PK `text`, se siembran con los ids legibles de los mocks): `exercises`,
   `routines` + `routine_blocks`, `nutrition_plans`, `clients` (+ columnas `subscription_until`,
   `nutrition_plan_id`, `client_user_id`), `body_measurements`, `client_routines`, `payments`,
   `workout_sessions` → `workout_exercise_logs` → `workout_set_logs`, `messages`. Fechas: las
   columnas son `date`/`timestamptz`; los tipos de dominio siguen usando strings `dd/mm/aaaa`, la
   conversión vive en el borde del Gateway (`ddmmaaaaToIso`/`isoToDdmmaaaa` en `src/lib/date.ts`).
3. **RLS por rol** (SECURITY DEFINER helpers `public.is_coach_of(cid)` / `public.is_client_of(cid)`).
   Coach = `coach_id = auth.uid()` sobre sus catálogos + `is_coach_of()` (FOR ALL) sobre lo de
   sus clientes. Cliente = solo lectura de su ficha, su rutina/plan asignados y los ejercicios de
   su coach; lectura + `insert` de sus `workout_sessions` (y logs/sets), **sin** delete/update;
   lectura + `insert` de sus `messages`; **sin** escritura sobre pagos, mediciones ni asignaciones.
   - ⚠️ **Bug corregido en `0002_phase10_rls_fix.sql`**: el helper original `is_my_client(cid)`
     devolvía `true` para el coach *y* para el propio cliente (`coach_id OR client_user_id`). Como
     las políticas `*_coach_all` son `FOR ALL`, el cliente heredaba UPDATE/DELETE sobre sus
     sesiones, mediciones, asignaciones y pagos. `0002` lo parte en dos helpers y repunta todas
     las políticas. Verificado por API: el cliente ya no puede borrar/editar sus sesiones (204
     pero 0 filas), ni crear pagos/mediciones/asignaciones (403); el coach conserva control total.
4. **7 Gateways Supabase** en `src/features/<x>/supabase/<x>Gateway.supabase.ts`. Campos
   derivados en lectura (ya no se almacenan): `Routine.exerciseCount`/`assignedCount` y
   `NutritionPlan.assignedCount` (vía embeds `count` — **resuelve la desincronización del mock**);
   peso vigente / IMC / `weightProgress` / `lastActivity` del cliente. Las lecturas derivadas de
   `workouts` (progreso, adherencia) **reutilizan las funciones puras de `progress.ts`**.
5. **Inyección**: `src/gateways/index.tsx` ramifica por `EXPO_PUBLIC_SUPABASE_URL` (mismo patrón
   que `configureAuthGateway`): presente → Gateways Supabase; ausente → mocks.
6. **Helpers nuevos**: `src/lib/supabaseQuery.ts` (`unwrap`/`unwrapRequired`/`unwrapList`),
   `src/lib/date.ts#{formatMemberSince,relativeDayLabel,ddmmaaaaToIso,isoToDdmmaaaa}`.
7. **Dashboard = composición real parcial**: `activeUsers`, `stats` (semana/mes con delta vs.
   periodo anterior), `weeklyAchievements` (PRs de `progress.ts` con fecha ≤ 7 días + rachas) y
   `recentActivity` (sesiones + mediciones + mensajes). `upcomingSessions` = `[]` — no hay modelo
   de agenda de sesiones (hueco conocido).

**Estado en el proyecto real (`oqgknkxnmhzmxlntckck`)** — ver "Estado del proyecto Supabase
real" al principio del archivo para el detalle vivo. Resumen: `0001`–`0006` aplicadas, catálogos
sembrados (`seed.sql` **solo** su parte de catálogos), **0 clientes** (correcto — no hay data de
demo), único usuario `entrenador@navyteam.com` (`role: coach`, name "Yonathan"). Un `client`
entra por el flujo de invitación de la Fase 11 (el coach lo da de alta desde la app → email →
`/set-password`), lo que setea `clients.client_user_id` automáticamente.

**Cómo aplicar las migraciones a otro entorno:** `npx supabase link --project-ref <ref>` +
`npx supabase db push`; el seed (`seed.sql`) se pega en el SQL Editor (el `db reset` local sí lo
corre solo).

**Pendiente de verificar:** el flujo end-to-end en la app (Expo web) contra Supabase real —
las pruebas hechas son a nivel de API REST con JWTs de cada rol.

**Huecos conocidos que quedan fuera:** `upcomingSessions` del dashboard; Supabase Storage para
avatares/portadas reales (siguen siendo placeholders); Realtime/offline-first (React Query
refetch cubre el cross-device).

---

## Fase 11 — Alta de clientes por invitación + política de datos + borrado en cascada — INFRA LISTA (falta `INVITE_REDIRECT_URL` + verificar el flujo del enlace)

Tres requisitos de producto juntos: el entrenador da de alta al cliente y este recibe un email
para crear su contraseña; política de tratamiento de datos con aceptación obligatoria; y que al
eliminar un cliente se borre **toda** su data y su cuenta de Auth.

**Qué se hizo:**
1. **Migración `0003_phase11_consent_access.sql`**:
   - `user_consents (user_id pk → auth.users on delete cascade, policy_version, accepted_at)`,
     RLS: el usuario gestiona solo su fila.
   - `client_access_status(cid)` → `'none' | 'invited' | 'active'` para el coach dueño (lee
     `email_confirmed_at`).
   - `consent_report()` → registro auditable (la aceptación del coach + la de sus clientes, con
     email/nombre/rol); base del botón "Descargar reporte" de Configuración.
2. **Edge Functions** (`supabase/functions/`, Deno; `_shared/` = cors + admin client + `getCaller`):
   - `invite-client` `POST { clientId }` — valida coach dueño, lee email/nombre de la fila,
     `admin.inviteUserByEmail` con `user_metadata { role:'client', name, client_id }` +
     `redirectTo = INVITE_REDIRECT_URL`, guarda `clients.client_user_id`. Reenvío: borra el
     usuario sin confirmar y re-invita.
   - `delete-client` `POST { clientId }` — `delete from clients` (cascada) + `admin.deleteUser`.
3. **`AuthGateway` crece**: `getConsent` / `acceptConsent` / `getConsentReport`. Impl mock
   (`secureStorage`) y Supabase (`user_consents` + `rpc('consent_report')`). `authStore` gana
   `consent` / `consentReady` (se cargan tras `restore()`/`login()`), `acceptConsent`,
   `refreshConsent`, `fetchConsentReport`.
4. **Gate de consentimiento**: `src/features/auth/policy.ts` (texto siguiendo la Ley 1581/2012,
   **borrador — requiere revisión jurídica**; datos del Responsable en `responsable.ts`, con
   placeholders a rellenar), `PrivacyPolicyView`, `useConsent()` (`needsConsent`). Rutas raíz:
   `app/privacy.tsx` (pública), `app/privacy-consent.tsx` (gate: aceptar → entra; no aceptar →
   logout), `app/set-password.tsx` (destino del enlace de invitación: establece sesión desde el
   token de la URL → form de contraseña → `updateUser` → `restore()` → gate → vista). Guards en
   `app/index.tsx`, `(app)/_layout.tsx`, `(client)/_layout.tsx` redirigen a `/privacy-consent`
   si falta aceptar. `(auth)/_layout.tsx` y `LoginForm` delegan en `index`.
5. **UI del coach**: `ClientsGateway` gana `invite(clientId)` / `accessStatus(clientId)`;
   `remove()` pasa a invocar `delete-client`. `ClientAccessCard` (feature `clients`) en una
   `CollapsibleSection` "Acceso a la app" del perfil. `clients/new.tsx` auto-invita si la ficha
   trae email. `clients/[id]/edit.tsx` — copy de borrado actualizado. `(app)/settings.tsx` deja
   de ser placeholder: enlace a la política + "Descargar reporte de consentimientos (CSV)"
   (`src/lib/{csv,download}.ts`; en web descarga, en nativo comparte).
6. `profile.tsx` del coach: `Alert.alert` → `confirm()` (bug de web) + fila a la política.

**Estado de activación (2026-09-07):** `0003` aplicado. `invite-client` + `delete-client`
desplegadas y ACTIVE. **Falta:**
```
npx supabase secrets set INVITE_REDIRECT_URL=https://<web-host>/set-password
```
+ Dashboard → Auth → URL Configuration: añadir `https://<web-host>/set-password` y
`https://<web-host>/**` a la allowlist. Auth → Email Templates → "Invite user": copy en español.
Rellenar `src/features/auth/responsable.ts` y hacer revisar `policy.ts` por un abogado.
El `<web-host>` sale del deploy de EAS Hosting (`npx eas deploy` / dashboard de hosting).

**Pendiente de verificar:** flujo completo del enlace de invitación (`set-password` usa
`setSession`/`exchangeCodeForSession` según el formato del enlace — puede necesitar ajuste
contra el enlace real de Supabase); reenvío de invitación; borrado en cascada end-to-end.

**Fuera de alcance (fases futuras anotadas por el usuario):** integración WhatsApp Business Cloud
API (analizada: requiere Meta Business verificado, número dedicado, plantillas aprobadas y coste
por conversación). — La gestión de "actividad reciente" / "logros" se hizo en la Fase 13 y el
rediseño visual del editor de rutinas también está hecho (ver secciones más abajo).

---

## Fase 12 — Comidas y alimentos en los planes de alimentación — INFRA LISTA (`0004` aplicado; falta verificación end-to-end)

Un plan de alimentación deja de ser "solo objetivo": se arma por **comidas** con **alimentos**
del catálogo y cantidades, y las kcal/macros se **calculan** de ese contenido.

**Qué se hizo:**
1. **Nueva feature `foods`** (`src/features/foods/`, calcado de `exercises`): catálogo de
   alimentos del coach — `unit` (`g`/`ml`/`unidad`), `refQuantity` (100 o 1) y macros
   (`kcal`/`proteinG`/`carbsG`/`fatG`) por esa porción. Gateway ×3 (interfaz + mock
   `@navyteam/foods` + Supabase), hooks, `FoodListItem`, `FoodEditorForm`, pantallas
   `app/(app)/foods/` + entrada en el Drawer ("Alimentos"). Seed de ~24 alimentos comunes.
2. **`src/features/nutrition/nutritionMath.ts`** (lógica pura, reusada por mock y Supabase —
   patrón `workouts/progress.ts`): `itemTotals`, `mealInputTotals`, `gramsToMacroPct`,
   `buildPlanDetail` (ensambla comidas resueltas + totales), `toPlanSummary`.
3. **Tipos** (`src/types/{food,nutrition}.ts`): `Food`, `Meal`/`MealItem` (lectura) y
   `MealInput`/`MealItemInput` (escritura); `NutritionPlan` gana `targetKcalPerDay` (objetivo
   opcional), `mealCount`, y `kcalPerDay`/`macros` pasan a ser **derivados**;
   `NutritionPlanDetail extends NutritionPlan` con `meals` + `totals`.
4. **`NutritionGateway`**: nuevo `get(id)`; `create`/`update` reciben `meals` (replace-all,
   como `RoutinesGateway` con `blocks`); `list()` devuelve resúmenes con totales calculados.
   Mock + Supabase actualizados. Hook `useNutritionPlan(id)`.
5. **Migración `0004_phase12_nutrition_meals.sql`**: tabla `foods` (+RLS coach/cliente),
   `nutrition_meals` + `nutrition_meal_items` (+RLS), y en `nutrition_plans` se añade
   `target_kcal_per_day` (backfill desde `kcal_per_day`) y se **eliminan** `kcal_per_day`,
   `protein_pct`, `carbs_pct`, `fat_pct` (eran placeholder). `supabase/seed.sql` actualizado
   (foods + planes con comidas de ejemplo en nut_001/nut_002).
6. **UI**: `NutritionPlanForm` rediseñado — metadata + constructor de comidas (`MealEditorCard`,
   `MealItemRow`, `FoodPickerModal`) + `PlanTotalsCard` con el total en vivo vs. el objetivo.
   `NutritionPlanDetail` rediseñado (total + comidas plegables con kcal por item + notas).
   `NutritionPlanCard` y la vista de cliente muestran el kcal calculado. `NumberField` gana
   `decimal` (macros con decimales) y `label` opcional. **`MealEditorCard` es colapsable**
   (cabecera nº + nombre + resumen `peso g · N alim.` + `kcal`; `expandedMealId` en el form, la
   comida nueva se abre sola) — mismo patrón que `ExerciseBlockCard` del editor de rutinas.
   - **Catálogo de alimentos por macros (2026-09-06):** `FoodEditorForm` ya no pide las kcal —
     solo proteína/carbos/grasas por porción; las kcal se **derivan** con
     `kcalFromMacros` (`src/features/foods/macros.ts` — Atwater 4/4/9) al guardar y en un preview
     en vivo. `foods.kcal` sigue siendo columna de BD (se escribe calculada; los alimentos ya
     existentes conservan su valor hasta que se re-guardan). `foodSchema` pierde el campo `kcal`.
   - **Peso de la comida en gramos (2026-09-06):** `Meal` gana `weightG` (suma de items en
     `g`+`ml`; las unidades no cuentan), calculado en `nutritionMath.resolveMeal`; helper
     `itemsWeightG` para el editor. Se muestra como métrica principal en `MealEditorCard` y en el
     resumen de `NutritionPlanDetail` (cliente).
7. **`clientsGateway.supabase.ts`**: el embed del plan asignado (`ClientDetail.assignedPlan`,
   también usado por la **lista** de clientes) dejó de pedir `kcal_per_day` (columna eliminada
   en `0004` → error `42703` al consultar usuarios). Ahora embebe
   `nutrition_meals(nutrition_meal_items(quantity, foods(ref_quantity, kcal)))` y calcula
   `kcalPerDay` con la misma regla que `buildPlanDetail` (suma de comidas, o el objetivo si el
   plan no tiene alimentos).

**Estado (2026-09-07):** `0004` aplicado; 24 alimentos + planes con comidas sembrados (`seed.sql`).

**Pendiente de verificar:** flujo completo en la app (crear plan con comidas → total en vivo →
guardar → reabrir → vista de cliente).

**Fuera de alcance:** que el cliente registre lo que comió / adherencia; variación por día de
la semana; import de bases de datos externas de alimentos.

---

## Fase 13 — Ocultar entradas del panel (feed + logros) — INFRA LISTA (`0005` aplicado; falta verificar con clientes reales)

El entrenador puede **ocultar** entradas de "Actividad reciente" y "Logros de la semana"
**deslizando la fila**; se guarda por entrenador y sobrevive recargas, con "Mostrar ocultos (N)"
para restaurarlas.

**Qué se hizo:**
1. **Migración `0005_phase13_dashboard_dismissals.sql`**: tabla `dashboard_dismissals`
   `(coach_id, item_key) pk` + RLS (`coach_id = auth.uid()`). El `item_key` es el `id` estable
   de cada `ActivityItem` / `Achievement` (ya lo generan los gateways de la Fase 10).
2. **`DashboardGateway`** gana `dismiss(itemKey)` / `restoreDismissed()`; `DashboardData` gana
   `dismissedCount`. Mock: AsyncStorage `@navyteam/dashboard-dismissals` (el seed se filtra al
   leer). Supabase: `select`/`upsert`/`delete` sobre `dashboard_dismissals`, `get()` filtra
   `recentActivity` + `weeklyAchievements` antes del `slice(12)`.
3. **`src/components/SwipeToDismiss.tsx`** (nuevo): envuelve una fila con `Swipeable` de
   `react-native-gesture-handler` (ya instalado; `GestureHandlerRootView` ya está en la raíz) —
   swipe → panel rojo "Ocultar" → `onDismiss`.
4. **`app/(app)/(tabs)/dashboard.tsx`**: cada `AchievementRow` / `ActivityRow` va envuelta en
   `SwipeToDismiss` (→ `useDismissDashboardItem`); enlace "Mostrar ocultos (N)"
   (→ `useRestoreDashboardItems`) al pie de "Actividad reciente".

**Estado (2026-09-07):** `0005` aplicado. Pendiente: verificar en la app cuando haya clientes
reales con actividad que ocultar.

**Fuera de alcance:** notificaciones push (`expo-notifications`); bandeja de notificaciones con
leído/no-leído; ocultar `stats` / `upcomingSessions`.

---

## Rediseño del editor de rutinas — COMPLETADO

Pedido por el usuario junto con las Fases 11–13 ("en la edición de rutina mejoremos el aspecto
visual, hagámoslo más llamativo"). Solo UI del editor compartido (`new.tsx` / `[id].tsx`), sin
tocar el modelo de datos ni el Gateway.

**Qué se hizo:**
1. **`RoutineSummaryCard`** (nuevo) — cabecera `bg-primary-light` en lo alto del editor: nombre
   de la rutina, pills de categoría/nivel y 3 cifras **en vivo** (ejercicios · series totales ·
   minutos) que se recalculan mientras se edita. `RoutineEditorForm` pasó a usar `watch()` de RHF
   para alimentarla.
2. **`ExerciseBlockCard`** (nuevo, reemplaza `ExerciseBlockRow`) — bloque **colapsable**:
   cabecera siempre visible (nº de orden + icono del grupo muscular + nombre + resumen
   `3 × 8–12`); al desplegar aparecen los campos reordenados (Series/Descanso, "Reps por serie"
   con mín–máx en línea, Carga sugerida) y los controles ↑/↓/Quitar. Solo un bloque abierto a la
   vez (`expandedId`); al añadir uno se abre automáticamente.
3. **`ExercisePickerModal`** (nuevo, extraído de `RoutineEditorForm`) — buscador (`SearchField`,
   sin acentos) + chips de grupo muscular; marca "Añadido" / "×N" en los ejercicios que ya están
   en la rutina (se permiten repetidos para superseries). Pie con "N de M ejercicios".
4. **`MUSCLE_GROUP_ICON`** subió de privado en `ExerciseListItem` a `exercises/labels.ts`
   (exportado por el barrel) y lo comparten la lista y el editor. `ExerciseListItem` gana
   `rightSlot?` para el badge del picker.
5. **Estado vacío / añadir** = botón punteado `＋ Añadir ejercicio` (mismo patrón que el editor
   de comidas de la Fase 12). El footer pegado muestra un resumen ("N ejercicios · N series").

La vista de solo lectura (`RoutineBlockList` / `AssignedRoutineView`, cliente) **no cambió**.

---

## Fase 15 — Notificaciones (bandeja in-app + push) — INFRA LISTA (`0006` aplicado, `send-push` desplegada, `app_config` OK; falta FCM + build nativo para el banner OS)

Bandeja de notificaciones para ambos roles + entrega push (Expo Push API). El **push real
no se puede probar en web ni Expo Go** (requiere un *development build* de EAS); la **bandeja
in-app + Realtime** sí funciona en web.

**Qué se hizo:**
1. **Migración `0006_phase15_notifications.sql`**:
   - `push_tokens (token pk, user_id, platform)` — RLS: el usuario gestiona los suyos.
   - `notifications (id, user_id, kind, title, body, data jsonb, read_at, pushed_at, created_at)`
     — RLS: el destinatario lee / marca leído / borra lo suyo; **sin INSERT** (solo los triggers).
   - `app_config (key, value)` — config interna (URL de las funciones + secreto del hook), sin
     acceso para `authenticated`.
   - `public._notify(user, kind, title, body, data)` (SECURITY DEFINER, **revocada de PostgREST**):
     inserta la fila y dispara `send-push` vía `pg_net` si `app_config` tiene `edge_url` (best-effort).
   - Triggers de dominio → `_notify()`: `messages` (avisa a la otra parte), `workout_sessions`
     (si lo registró el cliente → avisa al coach), `client_routines` (rutina asignada → cliente),
     `clients.nutrition_plan_id` (plan asignado → cliente), `payments` (pago → cliente).
   - `notifications` añadida a la publicación `supabase_realtime`.
2. **Edge Function `send-push`** (`supabase/functions/send-push/`, `--no-verify-jwt`, protegida
   con `x-push-secret` == env `PUSH_HOOK_SECRET`): carga la notificación + los `push_tokens` del
   destinatario, envía a `https://exp.host/--/api/v2/push/send` en lotes de 100, borra los tokens
   `DeviceNotRegistered`, marca `pushed_at`.
3. **Feature `src/features/notifications/`**: `NotificationsGateway` (`list`/`markRead`/`markAllRead`/
   `remove`/`registerToken`/`unregisterToken`/`subscribe`) + impl Supabase; hooks
   (`useNotifications`, `useUnreadNotificationCount`, mutaciones); `labels.ts`
   (`NOTIFICATION_KIND_META`, `routeForNotification(data, role)`); `push.ts` (envoltorio de
   `expo-notifications`, **no-op en web / simulador**); `NotificationsBridge` (montado en
   `app/_layout.tsx`: registra el token al login, enruta al tocar una notificación, refresca la
   bandeja por push en primer plano y por Realtime `INSERT`).
4. **UI**: `NotificationBell` (campana + contador) en la cabecera del panel del coach y del home
   del cliente; `NotificationsScreen` (bandeja compartida, `SwipeToDismiss` con "Eliminar",
   pull-to-refresh) en `app/(app)/notifications.tsx` (Drawer) y `app/(client)/notifications.tsx`
   (tab oculto). Entrada "Notificaciones" en el Drawer con badge en vivo (se quitó el `badge: 2`
   hardcodeado de "Mensajes").
5. **Deps nuevas**: `expo-notifications`, `expo-device` (vía `npx expo install`); plugin
   `expo-notifications` en `app.json`.

**"Actividad reciente" del panel** (pedido junto con esta fase):
- El feed se limita a los **últimos 30 días** (antes no tenía ventana → mediciones de 2025
  colgadas). `ActivityItem` gana `entityId` y las filas son **pulsables** → detalle de la sesión /
  perfil del cliente / hilo de mensajes. Pull-to-refresh en el panel. Ocultar una entrada sigue
  siendo deslizar la fila (Fase 13).
- La "data de pruebas" del seed se borra con `supabase/cleanup_demo_activity.sql` (lo ejecuta el
  usuario; borra `wko_*` / `msr_*` / `msg_*`, conserva el catálogo).
- "Que la actividad del cliente le llegue al coach": el trigger de `workout_sessions` genera la
  notificación; el panel refresca por Realtime + pull-to-refresh.

**Estado de activación (2026-09-07):** `0006` aplicado. `send-push` desplegada y ACTIVE.
`PUSH_HOOK_SECRET` (secret) configurado. Fila `app_config` con `edge_url` + `push_secret`
presente. **Pendiente:**
- Verificar que `app_config.push_secret` **coincide** con el `PUSH_HOOK_SECRET` de la función
  (ambos llegan como digest, no se pudieron comparar; si el push no se dispara, es lo primero a
  mirar). Corregir con:
  ```sql
  update public.app_config set value = '<mismo valor que PUSH_HOOK_SECRET>' where key = 'push_secret';
  ```
- La **bandeja in-app + Realtime** ya se puede probar en web (no necesita nada más).
- El **banner del sistema operativo** necesita FCM + `eas build` (ver "Build nativo"):
  `google-services.json` → `app.json`, subir la clave FCM V1 con `npx eas credentials`,
  `npm run build:dev`, instalar el APK en un Android.

**Fuera de alcance:** `eas.json` / dev build; preferencias por tipo de notificación; recordatorios
de sesión programados (`pg_cron`); badge de icono de app; agrupación / centro de notificaciones
con estados avanzados.

---

## Fase 16 — Endurecimiento de rendimiento y abuso — PENDIENTE (no empezada)

Tres frentes pedidos por el usuario (2026-09-06) para que el servicio aguante uso real y no se
lo pueda tumbar con tráfico. Ninguno cambia las interfaces `Gateway` ni la UI — son config de
React Query, una capa en las Edge Functions y una migración de índices.

### 16.1 — Cache en los servicios (menos consultas a la BD)

Hoy `app/_layout.tsx` crea `new QueryClient()` **sin opciones** → `staleTime: 0`: cada montaje
de pantalla o `refetchOnWindowFocus` dispara una consulta nueva. Con Supabase real eso es una
request de red + una evaluación de RLS por cada vuelta.

- **`QueryClient` con defaults sensatos** (`defaultOptions.queries`): `staleTime` de 30–60 s
  para todo (los datos de este dominio no cambian cada segundo), `gcTime` ~5 min,
  `refetchOnWindowFocus: false` en web (el pull-to-refresh y las invalidaciones tras mutación
  ya cubren la frescura), `retry: 1`.
- **`staleTime` por tipo de query** donde tenga sentido: catálogos (`exercises`, `foods`,
  `routines`, `nutrition-plans`) toleran minutos; el dashboard y las notificaciones, menos.
  Centralizarlo en un mapa por `queryKey[0]` o sobreescribir solo los hooks que lo necesiten.
- **Revisar los `invalidateQueries` existentes**: al subir `staleTime`, cualquier mutación que
  hoy dependa del refetch automático post-focus tiene que invalidar explícitamente su
  `queryKey` (la mayoría ya lo hace — patrón de la Fase 3).
- **Realtime como invalidador puntual** (ya hay precedente en `NotificationsBridge`): en vez de
  bajar `staleTime`, suscribirse a los `postgres_changes` de una tabla e invalidar su
  `queryKey` al llegar un cambio. Frescura sin polling. Candidatos: `messages`,
  `workout_sessions` en el panel del coach.
- **Persistir la cache entre recargas (web)** — opcional, más adelante:
  `@tanstack/query-async-storage-persister` + `persistQueryClient`. Ojo: la sesión vive en
  `sessionStorage` (Fase 9); persistir datos en `localStorage` mezclaría vidas distintas.

**Qué NO hacer:** cache del lado del servidor (Redis, vistas materializadas) — es prematuro; el
cuello hoy es el refetch agresivo del cliente, no la BD.

### 16.2 — Rate limiting (que no nos tumben el servicio)

- **PostgREST (los `*Gateway.supabase.ts`)**: el rate limiting real vive en el **proyecto de
  Supabase**, no en el código. Dashboard:
  - Auth → Rate Limits: bajar los de `/token`, `/signup`, `/recover`, `/otp`. El de `/token`
    (login) es el más importante — hoy `LoginForm` no tiene back-off ni captcha.
  - Auth → Settings: activar **Captcha** (hCaptcha/Turnstile) para `signup` / `signin`;
    `LoginForm` renderiza el widget y pasa el token.
  - Considerar poner Supabase detrás de **Cloudflare** (proxy) para rate limiting de borde por
    IP y protección L7 — la defensa más efectiva contra un flood y no toca código.
- **Edge Functions** (`invite-client`, `delete-client`, `send-push`): no tienen throttle propio.
  - `invite-client` / `delete-client` ya validan que el llamador sea el coach dueño, pero un
    coach comprometido podría invitar en bucle. Añadir un límite simple: tabla
    `rate_limit (key, window_start, count)` + check atómico al entrar (`insert ... on conflict`),
    `key = 'invite:' || caller_uid`, ventana de 1 min. Alternativa gestionada: **Upstash Redis**
    (`@upstash/ratelimit`, SDK para Deno) — suma dependencia externa, confirmar antes.
  - `send-push` ya está protegida por `x-push-secret`; el riesgo ahí es interno (trigger en
    bucle), no público.
- **App**: `LoginForm` con back-off local tras N intentos fallidos (UX, no seguridad — el
  servidor es la autoridad) + botón deshabilitado mientras hay request en vuelo (ya lo hace).

### 16.3 — Validar que las tablas estén indexadas

**Estado actual** (revisado 2026-09-06): el esquema base (`0001`) y las migraciones nuevas ya
traen índice en **casi todas** las FK y en las columnas de filtro frecuentes
(`*_coach_id_idx`, `*_client_id_idx`, `workout_sessions (client_id, date desc)`,
`messages (client_id, sent_at)`, `notifications (user_id, created_at desc)`, etc.).

**Huecos detectados** (candidatos para `supabase/migrations/0007_phase16_indexes.sql`):
- `workout_exercise_logs.exercise_id` — FK **sin índice**. Lo usa el progreso por ejercicio
  (`clients/[id]/progress/[exerciseId]`) y el gateway de workouts al agregar por ejercicio.
- `clients.nutrition_plan_id` — FK sin índice; lo usa el embed del plan asignado (lista +
  perfil de cliente).
- `workout_sessions.routine_id` — FK sin índice (menos crítico).
- `user_consents` — solo PK; revisar el `EXPLAIN` de la RPC `consent_report()`.
- **Índices que sostienen la RLS**: los helpers `is_coach_of` / `is_client_of` (`0002`) hacen
  subqueries sobre `clients` — cubiertas por `clients_coach_id_idx` / `clients_client_user_id_idx`.
  Verificar con `EXPLAIN (ANALYZE)` una query real de cada rol que la RLS no fuerce un seq scan.
- **Barrido sistemático**: Supabase Dashboard → Advisors → "Performance" marca índices
  faltantes automáticamente — usarlo primero. Luego correr las consultas más pesadas
  (dashboard, lista de clientes con embeds, historial de sesiones) con un dataset de ~50
  clientes × ~100 sesiones y mirar el plan.

**Entregable:** `0007_phase16_indexes.sql` con `create index concurrently` **solo** de lo que el
análisis confirme — un índice de más también cuesta en escritura.

---

## Decisión de backend (TOMADA — Supabase)

Confirmado por el usuario el 2026-09-04. Razones: Postgres + Auth + Storage + RLS + Realtime;
camino más corto desde los mocks; coincide con la spec del repo; portable (Postgres estándar);
la RLS por rol (cliente ve solo lo suyo, entrenador ve sus clientes) sale casi gratis — factor
que pesó desde que la vista de cliente entró al plan (Fase 8). La Fase 9 ya la usa para auth
(`@supabase/supabase-js`, credenciales en `.env`/`EXPO_PUBLIC_SUPABASE_URL`+`_ANON_KEY`); la
Fase 10 la usa para el resto de los Gateways (esquema de BD + RLS).

Independientemente del proveedor, el código se escribe contra las interfaces `Gateway`, nunca
contra el SDK del proveedor directamente en la UI o el store.

---

## Arquitectura de módulos

Meta a largo plazo: poder llevar módulos (`auth`, `profile`, `billing`, …) a otras apps.
No se hace monorepo todavía — **se endurecen los límites dentro de la app única** para que la
extracción futura sea mecánica.

**Reglas:**
- Cada feature vive en `src/features/<nombre>/` con un **`index.ts` como única API pública**.
  Nada fuera del barrel es API; el interior se puede refactorizar sin romper consumidores.
- **Prohibido importar entre features** salvo por su `index.ts`
  (`feature-billing` importa `@/features/auth`, nunca `@/features/auth/store/...`).
- Los módulos **no conocen la infra**: definen interfaces (`AuthGateway`, `BillingGateway`, …)
  y la app inyecta la implementación desde `app/_layout.tsx`.
- Navegación en la app, no en el módulo: los módulos exportan pantallas como componentes;
  `app/` decide las rutas.
- UI primitiva compartida en `src/components/` (`Button`, `Input`, `Card`, …); consume tokens
  de tema, no colores hardcodeados.
- Textos de UI: por ahora strings directos; migrar a claves i18n cuando aparezca un segundo idioma/app.

**Conversión a monorepo (Turborepo + pnpm workspaces):** solo cuando exista una 2ª app real que
consuma los módulos. Al llegar ese momento: `packages/feature-*`, `packages/ui`, `apps/*`, ajustar
`metro.config.js` (`watchFolders`, `nodeModulesPaths`). Preguntar antes de iniciar esta migración.

---

## Stack

**Instalado y en uso:**
- Expo SDK 57 (managed) + TypeScript strict + Expo Router
- Zustand (estado cliente) · React Hook Form + Zod (formularios)
- NativeWind v4 + Tailwind (estilos) · `@expo/vector-icons` (iconos)
- `@react-navigation/drawer` (menú lateral) + peers de Expo Router / NativeWind
  (`react-native-reanimated`, `react-native-gesture-handler`, `react-native-safe-area-context`, `react-native-screens`)
- `@tanstack/react-query` (cache + invalidación)
- `@react-native-async-storage/async-storage` — **sin uso** desde que se quitó la capa mock;
  se puede desinstalar (`npm uninstall`) en una limpieza aparte.
- `react-native-gifted-charts` + `react-native-svg` (peer obligatorio) + `expo-linear-gradient`
  (peer que el paquete resuelve de forma no perezosa al importar, aunque no se usen gradientes —
  ver Fase 6) — gráfica de evolución de peso del perfil de cliente y de progresión de carga
  (1RM estimado) del seguimiento de entrenamientos (Fase 7).
- `@supabase/supabase-js` — backend real (Fase 9: Auth; Fase 10: resto de Gateways).
- `expo-secure-store` — persistencia de sesión en nativo (ver `src/lib/secureStorage.ts`; en web
  el fallback es `sessionStorage`, ver "Endurecimiento de sesión" en la Fase 9).
- `expo-notifications` + `expo-device` — notificaciones push (Fase 15). El push remoto **no
  funciona en web ni Expo Go**; `src/features/notifications/push.ts` degrada a no-op ahí.
- `expo-dev-client` — runtime del *development build* (sustituye a Expo Go para probar el push
  y cualquier código nativo). Ver "Build nativo (EAS Build)" abajo.
- Dev: `eas-cli`, `supabase` (CLI — migraciones/seed de la Fase 10), `babel-preset-expo`, `tailwindcss`

**Previsto para más adelante (instalar cuando toque, con confirmación):**
- `jest` + `@testing-library/react-native` + `jest-expo` — testing (si se pide)

**No agregar librerías fuera de lo previsto sin explicar por qué y confirmar.**

---

## Estructura de carpetas

```
app/                          # Expo Router (rutas = pantallas)
  _layout.tsx                 # Stack raíz + QueryClientProvider + GatewaysProvider + SessionGuard + NotificationsBridge
  index.tsx                   # redirect según sesión y rol → (app) coach | (client) | (auth)
  (auth)/
    _layout.tsx               # si hay sesión → área según rol
    login.tsx
  (client)/                   # área del CLIENTE (Fase 8). Guard de rol. Sin Drawer.
    _layout.tsx               # Tabs (Inicio, Alimentación, Mis entrenos, Cuenta) + messages/notifications (href:null)
    routine.tsx               # tab "Inicio" (home: saludo + CoachMessageCard + hoy + semana + rutinas + campana)
    nutrition.tsx · account.tsx · messages.tsx (hilo con el entrenador) · notifications.tsx (bandeja)
    workouts/                 # _layout.tsx (Stack) + index.tsx + start.tsx (modal, entreno en
                               #   curso) + log.tsx (modal, registro manual) + [sessionId].tsx
  (app)/                      # área del ENTRENADOR. Guard de sesión + rebota clientes a (client).
    _layout.tsx               # Drawer (drawerContent = AppDrawerContent)
    (tabs)/
      _layout.tsx             # Tabs (Inicio, Usuarios, Rutinas, Alimentación, Perfil)
      dashboard.tsx           # tab Inicio
      clients/                # tab Usuarios → _layout.tsx (Stack) + index.tsx (lista) +
                               #   new.tsx (modal) + [id]/index.tsx (perfil) +
                               #   [id]/edit.tsx (push) + [id]/assign-routine.tsx,
                               #   [id]/assign-plan.tsx, [id]/add-measurement.tsx,
                               #   [id]/register-payment.tsx, [id]/log-session.tsx (modales) +
                               #   [id]/messages.tsx (hilo), [id]/session/[sessionId].tsx,
                               #   [id]/progress/[exerciseId].tsx (push)
      routines/               # tab Rutinas → _layout.tsx (Stack) + index.tsx (lista) +
                               #   new.tsx (modal) + [id].tsx (editor, push normal)
      nutrition/              # tab Alimentación → _layout.tsx (Stack) + index.tsx (lista) + new.tsx (modal)
      profile.tsx             # tab Perfil (entrenador, provisional)
    exercises/                # catálogo de ejercicios (fuera de las tabs, con entrada en el Drawer)
                               #   _layout.tsx (Stack) + index.tsx + new.tsx (modal) + [id].tsx (modal)
    messages.tsx              # lista de conversaciones (Drawer) → feature messages
    notifications.tsx         # bandeja de notificaciones (Drawer) → feature notifications
    stats.tsx                 # placeholder (Drawer)
    settings.tsx              # placeholder (Drawer)
    support.tsx               # placeholder (Drawer)

src/
  components/                 # UI compartida y agnóstica (Button, Input, TextField, SelectField,
                               # NumberField, DateField, Card, Badge, Avatar, Fab...)
  gateways/                   # GatewaysProvider — inyecta la implementación de cada Gateway
  assets/routines/            # portadas de rutina (banners del usuario optimizados) → routineImages.ts
  lib/                        # helpers sin UI (delay, storage, id, queryState, confirm, openDrawer, date, schedule)
  features/
    auth/                     # login + sesión (Zustand) + SessionGuard (timeout inactividad + onAuthStateChange) + consentimiento
    dashboard/                # tab Inicio
    clients/                  # clientes + perfil (mediciones, suscripción/pagos, asignación de rutinas)
    messages/                 # hilo entrenador↔cliente (MessageThread compartido, CoachMessageCard)
    notifications/            # bandeja in-app + push (gateway + NotificationsBridge + push.ts +
                               #   NotificationBell + NotificationsScreen). Triggers de BD en 0006.
    routines/                 # catálogo + editor (RoutineSummaryCard + ExerciseBlockCard colapsable
                               #   + ExercisePickerModal) + vista solo-lectura (RoutineBlockList,
                               #   AssignedRoutineView) para la vista de cliente
    nutrition/                # planes por comidas + editor (MealEditorCard/FoodPickerModal) +
                               #   nutritionMath.ts (cálculo puro) + NutritionPlanDetail (vista de cliente)
    exercises/                # catálogo de ejercicios (usado por el editor de rutinas)
    foods/                    # catálogo de alimentos (usado por el editor de planes) — patrón exercises
    workouts/                 # registro de entrenamientos + seguimiento (progress.ts = lógica pura,
                               #   logging.ts = helpers de borrador compartidos). SessionLoggerForm
                               #   (registro manual) y SessionDetailView los usan entrenador y cliente;
                               #   ActiveSessionForm + useStopwatch = entreno en curso (solo cliente)
    <feature>/
      index.ts                # API pública del módulo (ÚNICA puerta de entrada)
      gateway.ts               # interfaz(es) de infra que el módulo necesita
      components/
      hooks/
      labels.ts               # mapeo enum → etiqueta/tono de UI
      store/
      supabase/               # <x>Gateway.supabase.ts (implementación real, única)
  types/                      # tipos de dominio (auth, dashboard, client, routine, nutrition, exercise, workout, food, notification)
```

---

## Datos — Supabase

Cada feature define su interfaz `Gateway` (`src/features/<x>/gateway.ts`) y su única
implementación en `src/features/<x>/supabase/<x>Gateway.supabase.ts`. `src/gateways/index.tsx`
(y `configureAuthGateway` en `app/_layout.tsx`) las inyectan. La UI y los hooks hablan con la
interfaz, **nunca** con `@supabase/supabase-js` directamente.

- Lógica derivada pura (sin I/O) vive fuera del Gateway y se reutiliza:
  `src/features/workouts/progress.ts`, `src/features/nutrition/nutritionMath.ts`,
  `src/features/clients/subscription.ts`.
- Consultas anidadas con embeds de PostgREST; helpers en `src/lib/supabaseQuery.ts`
  (`unwrap` / `unwrapRequired` / `unwrapList`).
- Fechas: las columnas son `date`/`timestamptz`; los tipos de dominio usan strings
  `dd/mm/aaaa` — conversión en el borde del Gateway (`ddmmaaaaToIso`/`isoToDdmmaaaa`).
- Operaciones que necesitan `service_role` (crear/borrar usuarios de Auth) van en Edge
  Functions (`supabase/functions/`), nunca en la app.
- Data de demo: `supabase/seed.sql` (fuente única). Migraciones: `supabase/migrations/`.
- **Cache / rate limiting / índices:** ver **Fase 16** (pendiente). Hoy `QueryClient` no tiene
  `staleTime` → cada pantalla refetchea; la Fase 16 lo ajusta, revisa índices faltantes y añade
  rate limiting en Auth + Edge Functions.

---

## Convenciones de código

- TypeScript estricto: sin `any`, tipar todas las props y retornos de función.
- Componentes funcionales con hooks, sin clases.
- Un componente por archivo; nombre de archivo = nombre del componente (`LoginForm.tsx`).
- Imports internos con alias `@/*` → `src/*`.
- Estilos con NativeWind (`className`); colores solo desde tokens del tema (`primary`, `ink`, …).

---

## Cómo trabajar en el repo

```bash
npm start                 # dev server (Expo Go / emulador). --tunnel si no hay LAN
npm run web               # dev en navegador
npm run typecheck         # tsc --noEmit — DEBE pasar antes de dar una tarea por hecha
npm run export:web        # build web estático a dist/
npm run deploy            # export + deploy preview a EAS Hosting
npm run deploy -- --prod  # deploy a producción
npm run build:dev         # eas build --profile development --platform android (APK con dev client)
npm run build:preview     # eas build --profile preview --platform android (APK interno)
npm run build:prod        # eas build --profile production --platform android (AAB para Play Store)
```

Antes de cerrar cualquier tarea de código: `npm run typecheck` en verde y, si tocó bundling
(config de babel/metro/tailwind, deps), `npm run export:web` sin errores.

### Build nativo (EAS Build) — Android — CONFIG LISTA, build pendiente

`expo-notifications` (push, Fase 15) **no funciona en web ni Expo Go**: hace falta un
*development build*. Config hecha (2026-09-06): `expo-dev-client`, `eas.json` (perfiles
`development` / `preview` / `production`), `android.package` / `ios.bundleIdentifier` =
`com.navyteam.app` en `app.json`. El repo sigue "managed" (CNG) — no hay carpeta `android/`.

**Para el primer APK de dev** (sin push todavía):
```
npx eas login                              # como drmartinn25
npm run build:dev                          # ~10-15 min en la nube, sale un enlace al APK
```
Se instala en un Android real (o emulador con Play Services), y ya sustituye a Expo Go.

**Para que llegue el push** (FCM — Expo lo usa de relay):
1. Firebase console → nuevo proyecto → añadir app Android con package `com.navyteam.app`.
2. Descargar `google-services.json` → raíz del repo. Añadir a `app.json`:
   `"android": { ..., "googleServicesFile": "./google-services.json" }`. Commitearlo (no es secreto).
3. Firebase → Configuración → Cuentas de servicio → generar clave privada (JSON, FCM V1).
   `npx eas credentials` → Android → *Push Notifications: FCM V1* → subir ese JSON.
4. `npm run build:dev` otra vez. Al iniciar sesión, la app pide permiso, registra el token en
   `push_tokens` y ya entran los banners.

iOS queda fuera por ahora (necesita cuenta Apple Developer, 99 USD/año).

---

## Testing (si se pide)

- Jest + React Native Testing Library + `jest-expo`.
- Sin capa mock: para probar Gateways se necesita un proyecto Supabase de test, o `msw` /
  dobles a nivel de `@supabase/supabase-js`. La lógica pura (`progress.ts`, `nutritionMath.ts`,
  `subscription.ts`) se testea directa, sin red.
- Cubrir: validación de formularios, estados idle/loading/error/success, guards de navegación.

---

## Antes de hacer estos cambios, DETENERSE Y PREGUNTAR

- Instalar el SDK de un proveedor de backend (Supabase/AWS/…) — confirmar la decisión primero.
- Convertir el repo a monorepo.
- Añadir librerías no previstas en "Stack".
- Bajar/subir la versión del SDK de Expo.
- Cambiar el proveedor de estilos (NativeWind) o de navegación (Expo Router).
- Cambiar el proveedor de datos (Supabase) o volver a introducir una capa mock/offline.

---

## Roadmap de fases

> **Activación en Supabase — HECHA** (verificado 2026-09-07, ver "Estado del proyecto Supabase
> real" arriba): migraciones `0001`–`0006` aplicadas, las 3 Edge Functions desplegadas,
> `PUSH_HOOK_SECRET` + fila `app_config` presentes, catálogos sembrados, 0 clientes (correcto).
>
> **Lo que queda pendiente:**
> 1. **`INVITE_REDIRECT_URL`** (secret) — falta. `npx supabase secrets set
>    INVITE_REDIRECT_URL=https://<host-web>/set-password` (el `<host-web>` es el deploy de EAS
>    Hosting — sale de `npx eas deploy` / el dashboard de hosting).
> 2. **Allowlist de redirect**: Dashboard → Auth → URL Configuration → `https://<host>/set-password`
>    + `https://<host>/**`.
> 3. **Email template** "Invite user" en español (opcional).
> 4. **Verificación end-to-end** en la app: login del coach, crear un cliente real → llega el
>    email → `/set-password` → el cliente entra y ve su rutina/plan. Probar el push necesita el
>    build nativo (ver "Build nativo").
>
> **Antes de producción:** cambiar email/contraseña/nombre de `entrenador@navyteam.com` desde
> Dashboard → Authentication → Users (así `auth.identities` queda consistente). La contraseña
> `navyteam123` está en este archivo → **hay que cambiarla**. `supabase/cleanup_before_prod.sql`
> quedó para el escenario con clientes demo — hoy no hay ninguno, así que solo aplica la parte
> de la cuenta del coach.

1. ✅ **Fase 1** — Login + Dashboard con mocks. Desplegado en EAS Hosting (web).
2. ✅ **Fase 2** — Resto de pantallas con mocks + navegación real (Tabs + Drawer).
3. ✅ **Fase 3** — Capa de datos: patrón Gateway, mocks persistentes (AsyncStorage), React Query, scaffolding de formularios.
4. ✅ **Fase 4** — Catálogo de **Ejercicios** + **CRUD de Rutinas** (editor con bloques de ejercicio, asignación a clientes).
5. ✅ **Fase 5** — **CRUD de Alimentación** (planes solo objetivo: kcal + macros + notas).
6. ✅ **Fase 6** — **CRUD de Clientes** + perfil ampliado (fecha de nacimiento, historial de mediciones, gráfica de peso).
7. ✅ **Fase 7** — **Registro de entrenamientos** (el entrenador registra series/reps/peso por ejercicio) + seguimiento de progreso (progresión de carga, PRs, adherencia). Rediseño visual del dashboard aplicado después (datos aún mock); conexión a datos reales aplazada a Fase 10.
8. ✅ **Fase 8** — **Vista de cliente** con mocks (misma app, rutas por rol, grupo `app/(client)/`): el cliente ve su rutina y su plan asignados y registra sus propias series (reps/pesos) → llegan al panel del entrenador.
9. ✅ **Fase 9** — Backend real de autenticación **multi-rol** con Supabase (`AuthGateway` +
   `supabaseAuthGateway` + persistencia de sesión + refresh), verificado para ambos roles.
10. ✅ **Fase 10** — Conectar todos los Gateways a Supabase (esquema BD + RLS por rol en `0001`+`0002`, 7 Gateways `*.supabase.ts`, dashboard con composición real parcial). Migraciones aplicadas al proyecto real; RLS de coach y cliente verificada por API. Pendiente: verificación end-to-end en la app.
11. 🚧 **Fase 11** — Alta de clientes por **invitación de email** (Edge Functions `invite-client` /
    `delete-client`) + **política de tratamiento de datos** con aceptación obligatoria y reporte
    auditable + **borrado en cascada** real (datos + cuenta de Auth). Código completo; `0003`
    aplicado, funciones desplegadas. **Falta `INVITE_REDIRECT_URL` + allowlist de redirect + probar
    el flujo del enlace** (necesita el deploy web con URL conocida).
12. 🚧 **Fase 12** — **Comidas y alimentos en los planes** (catálogo `foods`, editor por comidas
    con `FoodPickerModal`, cálculo de kcal/macros en `nutritionMath.ts`, migración `0004`).
    Código completo; `0004` aplicado + foods sembrados. Pendiente: verificación end-to-end en la app.
13. 🚧 **Fase 13** — **Ocultar entradas del panel** (feed + logros) deslizando la fila;
    `dashboard_dismissals` + `SwipeToDismiss`. Código completo; `0005` aplicado. Pendiente:
    verificación end-to-end (necesita clientes reales con actividad).
14. 🚧 **Fase 15** — **Notificaciones** (bandeja in-app + push): tablas `notifications` /
    `push_tokens`, triggers de dominio → `_notify()`, Edge Function `send-push` (Expo Push API),
    `NotificationsBridge` + campana + bandeja. `0006` aplicado; `send-push` desplegada;
    `PUSH_HOOK_SECRET` + `app_config` configurados; `eas.json` + `expo-dev-client` listos.
    Pendiente: verificar `push_secret == PUSH_HOOK_SECRET` + FCM + `eas build` + probar el banner
    OS en un Android. La **bandeja in-app + Realtime** ya se puede probar en web. Incluye el
    rework de "Actividad reciente" (ventana de 30 días, filas pulsables, pull-to-refresh).
15. **Fase 16** — **Endurecimiento de rendimiento y abuso**: (a) cache en React Query
    (`QueryClient` con `staleTime`/`gcTime`, `refetchOnWindowFocus: false`, Realtime como
    invalidador); (b) rate limiting (Auth Rate Limits + Captcha en el Dashboard, límite propio en
    las Edge Functions, back-off en `LoginForm`, evaluar Cloudflare delante); (c) auditoría de
    índices (`0007_phase16_indexes.sql` — huecos ya detectados:
    `workout_exercise_logs.exercise_id`, `clients.nutrition_plan_id`, `workout_sessions.routine_id`;
    + barrido con el Advisor de Supabase). Ver la sección "Fase 16". PENDIENTE.
16. **Fase 14** — Facturación (el seguimiento de suscripción/pagos por cliente ya está hecho con
    mocks en el pulido pre-Fase 9; falta la pasarela de pago real y la conexión a datos).
17. **Asistente de IA para rutinas y planes** (idea de producto — *plus* de pago) — el entrenador
    describe los requerimientos de cada cliente (objetivo, nivel, edad/medidas) + sus
    **limitaciones alimentarias** (alergias, intolerancias, vegetariano/vegano, religión,
    presupuesto) + **limitaciones físicas** (lesiones, movilidad, condiciones médicas, equipo
    disponible) y un asistente propone un **borrador** de rutina (bloques del catálogo de
    ejercicios) y/o de plan de alimentación (comidas con alimentos del catálogo) que el entrenador
    **revisa y ajusta antes de asignar**. Notas técnicas: campos nuevos en `clients` para las
    limitaciones (tags + texto); Edge Function que llama a un LLM (Claude API) con el catálogo de
    `exercises`/`foods` del coach + el perfil como contexto → devuelve `RoutineInput` /
    `NutritionPlanInput` estructurado; el entrenador siempre valida (calidad + responsabilidad);
    disclaimer médico/legal (no sustituye criterio profesional, sobre todo con condiciones
    médicas); coste por generación → límite por plan o feature de pago.
18. **Futuro** — Integración WhatsApp; banner OS del push (FCM + `eas build`); recordatorios
    programados (`pg_cron`); monorepo + extracción de módulos; offline-first; builds para tiendas.

✅ **Rediseño del editor de rutinas** (post-Fase 13) — cabecera con cifras en vivo, bloques de
ejercicio colapsables, picker con buscador. Ver sección "Rediseño del editor de rutinas".
