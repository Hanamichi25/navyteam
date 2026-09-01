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
- Features de dominio: `auth`, `dashboard`, `clients`, `routines`, `nutrition` — cada una con
  `index.ts` como API pública.
- Estilos con **NativeWind v4** (tema en `tailwind.config.js`: `primary`, `ink`, `surface`, `line`).
- Formularios con React Hook Form + Zod.

**Credenciales mock** (`src/features/auth/mocks/users.mock.ts`):
- `entrenador@fitcoach.com` / `navyteam123`
- `lucia@navyteam.com` / `coach2026`

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
- Placeholders del Drawer: `(app)/{messages,stats,settings,support}.tsx` → componente `ComingSoon`.
- UI compartida en `src/components/`: `Avatar`, `Badge`, `ChipGroup`, `Fab`, `FeedbackState`,
  `ListRow`, `MacroBar`, `MetricTile`, `ProgressBar`, `ScreenHeader`, `SearchField`, `ComingSoon`, `AppDrawerContent`.
- Helpers en `src/lib/`: `delay`, `useAsyncData`, `openDrawer`.

### Deuda técnica / pulido pendiente

- Los FAB `+` y el botón de filtro "⋯" del header son placeholders con `// TODO(backend)`
  → los formularios de alta/edición son **Fase 5**.
- Imágenes de tarjetas: `https://picsum.photos/seed/...` en la data mock. `expo-image` no se instaló.
- Sección "Mensajes" (tab interno del perfil de cliente y entrada del Drawer) sin contenido real.
- El tab "Alimentación" puede recortarse en pantallas < 390 px de ancho.

---

## Reordenamiento del roadmap (decidido)

El **backend real de auth se movió al final** (antes Fase 3, ahora Fase 8). Con el patrón
Gateway, cada módulo habla con una interfaz; da igual si detrás hay un mock o un backend real,
así que conviene construir toda la funcionalidad con mocks primero y hacer el swap de backend
casi al final.

**Decisiones tomadas para las fases de CRUD:**
- El **registro de entrenamientos (reps/pesos) lo hace el entrenador** desde el panel. No hay
  app ni login de cliente todavía (eso queda para "Futuro").
- Los **planes de alimentación son solo objetivo**: kcal/día + macros (P/C/G) + notas de texto
  libre. Sin catálogo de alimentos.
- Los **Gateways mock persisten en el dispositivo** con `@react-native-async-storage/async-storage`
  (seed inicial desde los `*.mock.ts` actuales). Así el flujo de seguimiento se puede probar de
  verdad sin backend. Se descartan al conectar el backend real.

---

## Objetivo de la PRÓXIMA fase (Fase 3 — Capa de datos y edición)

Preparar la infraestructura común que necesitan todos los CRUD siguientes. **Sin backend real.**

**Alcance:**
1. **Patrón Gateway** en cada feature de dominio (`clients`, `routines`, `nutrition`, y las nuevas):
   `src/features/<x>/gateway.ts` con la interfaz (`list`, `get`, `create`, `update`, `remove`
   según aplique).
2. **Implementación mock persistente**: `src/features/<x>/mocks/<x>Gateway.mock.ts` — datos en
   memoria respaldados en **AsyncStorage** (`npx expo install @react-native-async-storage/async-storage`).
   Sigue simulando latencia (delay) y expone un caso de error. Seed desde los `*.mock.ts` actuales
   si el storage está vacío.
3. Los Gateways se inyectan desde `app/_layout.tsx` (Context por feature o uno agregado).
4. **`@tanstack/react-query`**: `QueryClientProvider` en `app/_layout.tsx`. Lecturas → `useQuery`,
   mutaciones → `useMutation` + `invalidateQueries`. `src/lib/useAsyncData.ts` se retira poco a poco.
5. **Scaffolding de formularios**: campos reutilizables (`TextField`, `Select`, `NumberField`,
   `DateField`) sobre RHF + Zod, y patrón de pantalla crear/editar (ruta dedicada o modal).

---

## Fases 4–7 — CRUD y seguimiento (con mocks)

Cada una construye sobre la capa de la Fase 3. No hay mockups de los editores → diseñar con el
sistema visual actual (mismos tokens y componentes). Conectar el FAB `+` y el botón "⋯" de cada
pantalla a su formulario.

- **Fase 4 — Ejercicios + CRUD de Rutinas.** Nueva feature `exercises`: catálogo (nombre, grupo
  muscular, equipo, descripción/media opcional) con su CRUD y filtro por grupo muscular. Editor de
  rutina: nombre, categoría, nivel y **lista ordenada de bloques de ejercicio** (cada bloque
  referencia un `Exercise` y define series, rango de reps, carga sugerida, descanso). Reordenar
  bloques. Asignar / desasignar rutina a clientes.
- **Fase 5 — CRUD de Alimentación.** Editor de plan (nombre, categoría, kcal/día, macros que
  sumen 100, notas). Asignar / desasignar plan a clientes.
- **Fase 6 — CRUD de Clientes + perfil ampliado.** Alta/edición: nombre, email, teléfono,
  **fecha de nacimiento**, avatar, objetivo, notas. **Historial de mediciones** (`BodyMeasurement`:
  fecha + peso, y otras medidas opcionales). Perfil ampliado: edad calculada, IMC recalculado,
  **gráfica de evolución de peso**, adherencia.
- **Fase 7 — Registro de entrenamientos + seguimiento.** Modelo: `WorkoutSession`
  (cliente + rutina + fecha) → `ExerciseLog` por ejercicio → `SetLog` (nº serie, reps, peso, RPE
  opcional). Flujo desde el perfil del cliente, lo hace **el entrenador**: "Registrar sesión" →
  rutina asignada → series por ejercicio → guardar. Historial de sesiones. **Progreso por
  ejercicio**: progresión de carga (gráfica), volumen, PRs. Dashboard y perfil del cliente pasan
  a mostrar métricas reales derivadas del logging.

---

## Fase 8 — Backend real de autenticación

Sustituir el mock de auth por un backend real, manteniendo intacta la interfaz que consume la UI.

**Alcance:**
1. **Decidir el proveedor de backend PRIMERO** (ver "Decisión de backend" abajo). No escribir
   código de integración ni instalar SDKs de proveedor hasta que esté decidido — preguntar.
2. `src/features/auth/gateway.ts` → interfaz `AuthGateway` (`signIn`, `signOut`, `getSession`, `refresh`).
   El mock actual pasa a ser `mockAuthGateway`. La implementación real
   (`supabaseAuthGateway` / `cognitoAuthGateway` / …) se inyecta desde `app/_layout.tsx`.
3. `authStore` recibe el `AuthGateway` por inyección, no lo importa.
4. **Persistencia de sesión** con `expo-secure-store` (access token en memoria, refresh en secure-store).
5. Manejo de **expiración y refresh** de sesión.

**No hacer salvo que se pida:** registro, recuperación de contraseña, biometría, OAuth social.

---

## Fase 9 — Conectar todos los Gateways a datos reales

Con el proveedor elegido y `AuthGateway` real en marcha, migrar cada `*Gateway` mock a su
implementación real: esquema de BD (clientes, medidas, ejercicios, rutinas, planes, sesiones,
series), permisos/RLS, migraciones. Los mocks quedan como implementación de referencia para
tests y desarrollo offline.

---

## Decisión de backend (ABIERTA)

Aún **no está decidido**. Candidatos:

| Opción | A favor | En contra |
|---|---|---|
| **Supabase** | Postgres + Auth + Storage + RLS + Realtime; camino más corto desde los mocks; coincide con la spec del repo; portable (es Postgres estándar) | SaaS gestionado |
| **AWS serverless** | Control y escala; encaja si el equipo ya vive en AWS. Stack: API Gateway + Lambda + Aurora Serverless v2 / DynamoDB + Cognito + S3, o Amplify Gen 2 | Más piezas de infra; Cognito incómodo; más lento al MVP |

**Regla:** al arrancar la Fase 8, confirmar con el usuario qué proveedor se usa antes de instalar
dependencias. Independientemente del proveedor, el código se escribe contra las interfaces `Gateway`,
nunca contra el SDK del proveedor directamente en la UI o el store.

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
- Dev: `eas-cli`, `babel-preset-expo`, `tailwindcss`

**Previsto para Fase 3 (aprobado, instalar cuando toque):**
- `@tanstack/react-query` — cache + invalidación tras mutaciones
- `@react-native-async-storage/async-storage` — persistencia de los Gateways mock

**Previsto para Fase 8+ (instalar cuando toque, con confirmación):**
- `expo-secure-store` — tokens
- SDK del proveedor de backend elegido (`@supabase/supabase-js` u equivalente)
- `jest` + `@testing-library/react-native` + `jest-expo` — testing (si se pide)

**Posible en fases de CRUD (confirmar):** una librería de gráficas (evolución de peso,
progresión de carga) — p. ej. `react-native-gifted-charts` o SVG a mano.

**No agregar librerías fuera de lo previsto sin explicar por qué y confirmar.**

---

## Estructura de carpetas

```
app/                          # Expo Router (rutas = pantallas)
  _layout.tsx                 # Stack raíz + providers (aquí se inyectan los Gateways en Fase 3)
  index.tsx                   # redirect según sesión → /(app)/(tabs)/dashboard | /(auth)/login
  (auth)/
    _layout.tsx               # si hay sesión → app
    login.tsx
  (app)/                      # área autenticada. Guard de sesión aquí.
    _layout.tsx               # Drawer (drawerContent = AppDrawerContent)
    (tabs)/
      _layout.tsx             # Tabs (Inicio, Usuarios, Rutinas, Alimentación, Perfil)
      dashboard.tsx           # tab Inicio
      clients/                # tab Usuarios → _layout.tsx (Stack) + index.tsx (lista) + [id].tsx (perfil)
      routines.tsx            # tab Rutinas
      nutrition.tsx           # tab Alimentación
      profile.tsx             # tab Perfil (entrenador, provisional)
    messages.tsx              # placeholder (Drawer)
    stats.tsx                 # placeholder (Drawer)
    settings.tsx              # placeholder (Drawer)
    support.tsx               # placeholder (Drawer)

src/
  components/                 # UI compartida y agnóstica (Button, Input, Card, Badge, Avatar, Fab...)
  lib/                        # helpers sin UI (delay, useAsyncData, openDrawer)
  features/
    auth/                     # login + sesión (Zustand)
    dashboard/                # tab Inicio
    clients/                  # lista de clientes + perfil de cliente
    routines/                 # catálogo de rutinas
    nutrition/                # catálogo de planes de alimentación
    <feature>/
      index.ts                # API pública del módulo (ÚNICA puerta de entrada)
      gateway.ts              # interfaz(es) de infra que el módulo necesita (desde Fase 3)
      components/
      hooks/
      labels.ts               # mapeo enum → etiqueta/tono de UI
      store/
      mocks/                  # *.mock.ts — datos fake (+ implementación mock del gateway en Fase 3)
  types/                      # tipos de dominio (auth, dashboard, client, routine, nutrition)
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
3. ⏳ **Fase 3** — Capa de datos: patrón Gateway, mocks persistentes (AsyncStorage), React Query, scaffolding de formularios.
4. **Fase 4** — Catálogo de **Ejercicios** + **CRUD de Rutinas** (editor con bloques de ejercicio, asignación a clientes).
5. **Fase 5** — **CRUD de Alimentación** (planes solo objetivo: kcal + macros + notas).
6. **Fase 6** — **CRUD de Clientes** + perfil ampliado (fecha de nacimiento, historial de mediciones, gráfica de peso).
7. **Fase 7** — **Registro de entrenamientos** (el entrenador registra series/reps/peso por ejercicio) + seguimiento de progreso.
8. **Fase 8** — Backend real de autenticación (Gateway + proveedor + secure-store + refresh).
9. **Fase 9** — Conectar todos los Gateways a datos reales (esquema BD, permisos, migraciones).
10. **Fase 10** — Facturación.
11. **Futuro** — Monorepo + extracción de módulos; vista/login de **cliente** (que el cliente registre sus propios entrenos); offline-first; notificaciones; EAS Build + tiendas.
