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

## Objetivo de la PRÓXIMA fase (Fase 3 — Backend real de autenticación)

Sustituir el mock de auth por un backend real, manteniendo intacta la interfaz que consume la UI.

**Alcance:**
1. **Decidir el proveedor de backend PRIMERO** (ver "Decisión de backend" abajo). No escribir
   código de integración ni instalar SDKs de proveedor hasta que esté decidido — preguntar.
2. Introducir el patrón **Gateway** (inversión de dependencias) en `src/features/auth`:
   - `src/features/auth/gateway.ts` → interfaz `AuthGateway` (`signIn`, `signOut`, `getSession`, `refresh`).
   - El mock actual pasa a ser una implementación más de esa interfaz (`mockAuthGateway`), útil para tests y desarrollo offline.
   - La implementación real (`supabaseAuthGateway` / `cognitoAuthGateway` / …) se inyecta desde `app/_layout.tsx`.
3. `authStore` deja de importar el mock directamente; recibe el `AuthGateway` por inyección.
4. **Persistencia de sesión** con `expo-secure-store` (access token en memoria, refresh token en secure-store).
5. Manejo de **expiración y refresh** de sesión (interceptor / auto-refresh).
6. Añadir **`@tanstack/react-query`** para estado de servidor (cache, reintentos).

**No hacer en esta fase salvo que se pida:** registro, recuperación de contraseña, biometría,
OAuth social, notificaciones push, offline-first / SQLite.

---

## Decisión de backend (ABIERTA)

Aún **no está decidido**. Candidatos:

| Opción | A favor | En contra |
|---|---|---|
| **Supabase** | Postgres + Auth + Storage + RLS + Realtime; camino más corto desde los mocks; coincide con la spec del repo; portable (es Postgres estándar) | SaaS gestionado |
| **AWS serverless** | Control y escala; encaja si el equipo ya vive en AWS. Stack: API Gateway + Lambda + Aurora Serverless v2 / DynamoDB + Cognito + S3, o Amplify Gen 2 | Más piezas de infra; Cognito incómodo; más lento al MVP |

**Regla:** al arrancar la Fase 3, confirmar con el usuario qué proveedor se usa antes de instalar
dependencias. Independientemente del proveedor, el código se escribe contra la interfaz `AuthGateway`,
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

**Previsto para Fase 3+ (instalar cuando toque, con confirmación):**
- `@tanstack/react-query` — estado de servidor
- `expo-secure-store` — tokens
- SDK del proveedor de backend elegido (`@supabase/supabase-js` u equivalente)
- `jest` + `@testing-library/react-native` + `jest-expo` — testing (si se pide)

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

Mientras un módulo no tenga backend real, su data sale de `*.mock.ts` que:
- Simulan latencia (delay 500–1000ms) para ver los estados de loading.
- Incluyen al menos un caso de error.
- Implementan **la misma interfaz `Gateway`** que tendrá la versión real, para que el swap sea
  cambio de implementación, no de interfaz.

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
2. ✅ **Fase 2** — Resto de pantallas con mocks (Menú lateral, Mis Usuarios, Perfil de Usuario, Rutinas, Planes de Alimentación) + navegación real (Tabs + Drawer).
3. ⏳ **Fase 3** — Backend real de autenticación (Gateway + proveedor + secure-store + refresh + React Query).
4. **Fase 4** — Conectar los módulos de dominio (usuarios, rutinas, nutrición) a datos reales vía Gateways.
5. **Fase 5** — CRUD completo: crear/editar rutinas, planes y clientes (los FAB `+` y formularios).
6. **Fase 6** — Facturación.
7. **Futuro** — Monorepo + extracción de módulos reutilizables; offline-first; notificaciones; builds nativas (EAS Build) y publicación en tiendas.
