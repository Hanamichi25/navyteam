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

## Estado actual (Fases 1 y 2 — COMPLETADAS)

La app está construida hasta el nivel de UI completa con **datos mock**, y la Fase 1
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
   `expo-secure-store` en nativo (iOS Keychain / Android Keystore) y `localStorage` en web,
   porque `expo-secure-store` **no tiene implementación web** (`ExpoSecureStore.default
   .getValueWithKeyAsync is not a function` en vez de fallar de forma legible — se descubrió
   probando el login real con Playwright). Mismo precedente que `src/lib/confirm.ts` (rama por
   `Platform.OS`). Lo usan tanto `mockAuthGateway` (sesión mock persistida) como
   `src/lib/supabase.ts` (`createClient(..., { auth: { storage: secureStorage } })`).
5. **Refresh de sesión**: `supabase-js` lo maneja internamente (`autoRefreshToken: true`);
   `AuthGateway.refresh()` expone `supabase.auth.refreshSession()` para el caso en que la UI
   necesite forzarlo.

**Verificado con Playwright (Expo web) contra un proyecto Supabase real:** login de un usuario
`role:'coach'` → dashboard del panel con su nombre real; reload de página → sesión persiste (no
vuelve a login); "Cerrar Sesión" desde el Drawer → limpia sesión, reload posterior se queda en
`/login`. Mismo flujo repetido con un usuario `role:'client', client_id:'cli_luis'` → enruta a
`/(client)/routine` con los datos reales de ese cliente (rutina asignada, mensaje del
entrenador), persiste tras reload. `typecheck` y `export:web` en verde.

**No se hizo (fuera de alcance, sin pedirse):** registro self-service, recuperación de
contraseña, biometría, OAuth social (los botones Google/Apple del login siguen siendo
`// TODO(backend)`). Alta de usuarios: sigue siendo manual desde el dashboard de Supabase — un
flujo propio (el entrenador da de alta un cliente y esto crea su usuario) es Fase 10.

---

## Fase 10 — Conectar todos los Gateways a datos reales

Con el proveedor elegido y `AuthGateway` real en marcha, migrar cada `*Gateway` mock a su
implementación real: esquema de BD (clientes, medidas, ejercicios, rutinas, planes, sesiones,
series), migraciones, y **permisos por rol**: un `client` solo lee/escribe **sus** datos
(sus sesiones, su rutina/plan asignados); un `coach` accede a **sus** clientes y a todo lo que
crea. Aquí es donde "cliente registra → entrenador lo ve" funciona de verdad entre dispositivos.
Los mocks quedan como implementación de referencia para tests y desarrollo offline.

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
- `@tanstack/react-query` (cache + invalidación) · `@react-native-async-storage/async-storage`
  (persistencia de los Gateways mock)
- `react-native-gifted-charts` + `react-native-svg` (peer obligatorio) + `expo-linear-gradient`
  (peer que el paquete resuelve de forma no perezosa al importar, aunque no se usen gradientes —
  ver Fase 6) — gráfica de evolución de peso del perfil de cliente y de progresión de carga
  (1RM estimado) del seguimiento de entrenamientos (Fase 7).
- `@supabase/supabase-js` — backend real (Fase 9: Auth; Fase 10: resto de Gateways).
- `expo-secure-store` — persistencia de sesión en nativo (ver `src/lib/secureStorage.ts` para
  el fallback en web, que no lo soporta).
- Dev: `eas-cli`, `babel-preset-expo`, `tailwindcss`

**Previsto para más adelante (instalar cuando toque, con confirmación):**
- `jest` + `@testing-library/react-native` + `jest-expo` — testing (si se pide)

**No agregar librerías fuera de lo previsto sin explicar por qué y confirmar.**

---

## Estructura de carpetas

```
app/                          # Expo Router (rutas = pantallas)
  _layout.tsx                 # Stack raíz + QueryClientProvider + GatewaysProvider
  index.tsx                   # redirect según sesión y rol → (app) coach | (client) | (auth)
  (auth)/
    _layout.tsx               # si hay sesión → área según rol
    login.tsx
  (client)/                   # área del CLIENTE (Fase 8). Guard de rol. Sin Drawer.
    _layout.tsx               # Tabs (Inicio, Alimentación, Mis entrenos, Cuenta) + messages (href:null)
    routine.tsx               # tab "Inicio" (home: saludo + CoachMessageCard + hoy + semana + rutinas)
    nutrition.tsx · account.tsx · messages.tsx (hilo con el entrenador, se abre desde el home)
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
    auth/                     # login + sesión (Zustand)
    dashboard/                # tab Inicio
    clients/                  # clientes + perfil (mediciones, suscripción/pagos, asignación de rutinas)
    messages/                 # hilo entrenador↔cliente (MessageThread compartido, CoachMessageCard)
    routines/                 # catálogo + editor con bloques + vista solo-lectura (RoutineBlockList,
                               #   AssignedRoutineView) para la vista de cliente
    nutrition/                # catálogo + editor + NutritionPlanDetail (solo lectura, vista de cliente)
    exercises/                # catálogo de ejercicios (usado por el editor de rutinas)
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
      mocks/                  # *.mock.ts (datos semilla) + <x>Gateway.mock.ts (implementación
                               # mock persistida en AsyncStorage)
  types/                      # tipos de dominio (auth, dashboard, client, routine, nutrition, exercise, workout)
```

---

## Mocks

Mientras un módulo no tenga backend real, su data sale de un mock que:
- Simula latencia (delay 500–1000ms) para ver los estados de loading.
- Incluye al menos un caso de error.
- Implementa **la misma interfaz `Gateway`** que tendrá la versión real, para que el swap sea
  cambio de implementación, no de interfaz.
- Desde la Fase 3, además **persiste en AsyncStorage** (create/update/remove sobreviven al
  recargar). El `*.mock.ts` de datos actual sirve de **seed** cuando el storage está vacío.

Los mocks **no se borran** al conectar el backend: pasan a ser la implementación de referencia
para tests y desarrollo offline.

---

## Convenciones de código

- TypeScript estricto: sin `any`, tipar todas las props y retornos de función.
- Componentes funcionales con hooks, sin clases.
- Un componente por archivo; nombre de archivo = nombre del componente (`LoginForm.tsx`).
- Mocks con sufijo `.mock.ts`.
- Comentar con `// TODO(backend):` los puntos donde una implementación real reemplazará al mock.
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
```

Antes de cerrar cualquier tarea de código: `npm run typecheck` en verde y, si tocó bundling
(config de babel/metro/tailwind, deps), `npm run export:web` sin errores.

---

## Testing (si se pide)

- Jest + React Native Testing Library + `jest-expo`.
- Los tests usan la implementación mock del `Gateway`; no requieren mockear red.
- Cubrir: validación de formularios, estados idle/loading/error/success, guards de navegación.

---

## Antes de hacer estos cambios, DETENERSE Y PREGUNTAR

- Instalar el SDK de un proveedor de backend (Supabase/AWS/…) — confirmar la decisión primero.
- Convertir el repo a monorepo.
- Añadir librerías no previstas en "Stack".
- Bajar/subir la versión del SDK de Expo.
- Cambiar el proveedor de estilos (NativeWind) o de navegación (Expo Router).
- Borrar los mocks en lugar de mantenerlos como implementación del Gateway.

---

## Roadmap de fases

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
10. **Fase 10** — Conectar todos los Gateways a datos reales (esquema BD, migraciones, **permisos por rol** — cliente ve solo lo suyo).
11. **Fase 11** — Facturación (el seguimiento de suscripción/pagos por cliente ya está hecho con
    mocks en el pulido pre-Fase 9; falta la pasarela de pago real y la conexión a datos).
12. **Futuro** — Monorepo + extracción de módulos; offline-first; notificaciones (recordatorio de sesión, cliente registró entreno); chat cliente–entrenador; EAS Build + tiendas.
