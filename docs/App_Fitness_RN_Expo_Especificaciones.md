# Especificaciones Técnicas: App Fitness con React Native + Expo
## De la investigación de mercado a la arquitectura de desarrollo

**Basado en:** Análisis de recomendaciones de usuarios (Agosto 2026)
**Stack:** React Native + Expo (SDK 52+), TypeScript

---

## 📌 CÓMO USAR ESTE DOCUMENTO

Cada problema detectado en la investigación de usuarios se traduce aquí en:
1. Una decisión de arquitectura o librería concreta
2. Buenas prácticas de seguridad aplicables
3. Estructura de código recomendada

---

## 1️⃣ STACK TECNOLÓGICO RECOMENDADO

### Core

| Necesidad | Herramienta | Por qué |
|-----------|-------------|---------|
| Framework | Expo (Managed Workflow + Dev Client) | Builds OTA, EAS Build/Submit, acceso nativo sin eject |
| Lenguaje | TypeScript (strict mode) | Previene bugs de tipos antes de producción |
| Navegación | Expo Router (file-based) | Deep linking nativo, más mantenible que React Navigation manual |
| Estado global | Zustand o Redux Toolkit | Zustand para apps medianas (menos boilerplate); RTK si el equipo ya lo conoce |
| Estado de servidor | TanStack Query (React Query) | Cache, reintentos automáticos, sincronización en segundo plano |
| Formularios | React Hook Form + Zod | Validación tipada y performante |
| Estilos | NativeWind (Tailwind para RN) o StyleSheet | Consistencia visual rápida |
| Base de datos local | Expo SQLite + Drizzle ORM (o WatermelonDB) | Necesario para el modo offline-first (ver sección 3) |
| Backend sugerido | Supabase o Firebase | Autenticación + base de datos + storage integrados; alternativa: API propia (Node/NestJS) |

### Librerías específicas por problema detectado

| Problema del análisis | Librería / Servicio | Sección |
|---|---|---|
| Sincronización con wearables | `expo-health-connect` (Android), `react-native-health` (iOS/HealthKit) | 3 |
| Escaneo de código de barras | `expo-camera` + `expo-barcode-scanner` | 4 |
| Notificaciones motivacionales | `expo-notifications` | 5 |
| Autenticación biométrica | `expo-local-authentication` | 2 |
| Almacenamiento seguro de tokens | `expo-secure-store` | 2 |
| Manejo de red offline | `@react-native-community/netinfo` | 3 |

---

## 2️⃣ AUTENTICACIÓN CON EXPO

### 2.1 Estrategia recomendada

Usar **autenticación basada en tokens (JWT) con refresh tokens**, delegando el proveedor de identidad a un servicio gestionado en lugar de construir el sistema desde cero.

**Opciones recomendadas (de más a menos recomendada para un MVP):**

1. **Supabase Auth** — email/password, OAuth (Google, Apple), magic links, gestión de sesión automática. Integra bien con Expo.
2. **Clerk** o **Auth0** — si se necesita SSO empresarial o compliance más estricto.
3. **Firebase Authentication** — buena opción si ya se usa Firestore.
4. **Sistema propio** — solo si hay requisitos regulatorios muy específicos; implica mucho más trabajo de seguridad.

> ⚠️ Evitar guardar contraseñas o lógica de hashing en el cliente. La app **nunca** debe calcular ni validar hashes de contraseña — eso es responsabilidad exclusiva del backend/proveedor de auth.

### 2.2 Flujo de autenticación

```
1. Usuario ingresa credenciales → 2. Backend/Auth Provider valida
        ↓
3. Se emiten: access_token (corta duración, ~15 min) + refresh_token (larga duración)
        ↓
4. access_token → guardado en memoria (estado de la app)
   refresh_token → guardado en expo-secure-store (Keychain/Keystore nativo)
        ↓
5. Interceptor de red renueva el access_token automáticamente al expirar
        ↓
6. Logout → se revoca el refresh_token en backend + se limpia secure-store
```

### 2.3 Autenticación biométrica (Face ID / huella)

Usar `expo-local-authentication` como **segundo factor de conveniencia**, nunca como único mecanismo:

```typescript
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

async function unlockWithBiometrics() {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();

  if (!hasHardware || !isEnrolled) {
    // Degradar con gracia a login con contraseña/PIN
    return { success: false, reason: 'unavailable' };
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Confirma tu identidad',
    cancelLabel: 'Cancelar',
    disableDeviceFallback: false, // permite PIN del dispositivo como respaldo
  });

  if (result.success) {
    const refreshToken = await SecureStore.getItemAsync('refresh_token');
    // usar refreshToken para obtener un nuevo access_token
  }

  return result;
}
```

### 2.4 OAuth social (Google / Apple)

- Usar `expo-auth-session` + `expo-web-browser` para el flujo OAuth con PKCE.
- **Apple Sign-In es obligatorio** en iOS si se ofrece cualquier otro login social (requisito de Apple App Store).
- Nunca embeber `client_secret` en el bundle de la app — el intercambio de código por token debe hacerse en el backend.

### 2.5 Sesión y expiración

- Access token corto (10–15 min) reduce ventana de riesgo si se filtra.
- Refresh token con rotación: cada vez que se usa, se invalida y se emite uno nuevo (detecta robo de tokens).
- Cerrar sesión en todos los dispositivos: endpoint backend que invalida todos los refresh tokens del usuario (útil tras cambio de contraseña).

---

## 3️⃣ SEGURIDAD

### 3.1 Almacenamiento de datos sensibles

| Tipo de dato | Dónde guardarlo | Nunca hacer esto |
|---|---|---|
| Tokens de sesión | `expo-secure-store` (Keychain/Keystore) | AsyncStorage sin cifrar |
| Datos de salud (peso, calorías, rutinas) | SQLite local cifrado + sincronización a backend con TLS | Guardar en texto plano en logs |
| Credenciales de terceros (Spotify, Google Fit) | Backend actúa de intermediario (BFF); el token de terceros nunca vive en el cliente si se puede evitar | Exponer client secrets en el bundle |
| PII (nombre, email, ubicación) | Cifrado en tránsito y reposo en backend | Enviar por query params (queda en logs de servidor) |

### 3.2 Comunicación con el backend

- **HTTPS obligatorio** en todos los endpoints (Expo bloquea HTTP en producción por defecto en iOS con ATS).
- **Certificate pinning** opcional para datos de salud sensibles (usar `expo-dev-client` con un plugin nativo si se requiere; no disponible en Expo Go).
- Variables de entorno con `expo-constants` + `EAS Secrets` — nunca hardcodear API keys en el código fuente.

```typescript
// app.config.ts
export default {
  expo: {
    extra: {
      apiUrl: process.env.API_URL,
    },
  },
};
```

```bash
# Nunca commitear .env con secretos reales
eas secret:create --name API_URL --value "https://api.tuapp.com"
```

### 3.3 Validación y sanitización

- Validar **toda** entrada del usuario con Zod tanto en cliente (UX) como en backend (seguridad real — el cliente nunca es de confianza).
- Sanitizar inputs antes de guardarlos (previene inyección si el backend usa SQL directo).
- Rate limiting en el backend para endpoints de login, registro y recuperación de contraseña (previene fuerza bruta).

### 3.4 Privacidad (respuesta directa a las quejas de Strava/Fitbit del análisis)

- Implementar pantalla de **consentimiento granular** en el onboarding: qué datos se recopilan y para qué.
- Endpoint de **exportar mis datos** y **eliminar mi cuenta** (requisito GDPR/CCPA).
- Nunca enviar datos de ubicación o salud a analíticas de terceros sin anonimizar.
- Usar `expo-tracking-transparency` en iOS si se hace tracking entre apps (obligatorio por Apple ATT).

### 3.5 Ofuscación y hardening

- Habilitar Hermes (por defecto en Expo SDK 52+) — ya ofusca parcialmente el bytecode JS.
- Para builds de producción, usar `eas build` con Proguard/R8 habilitado en Android.
- No incluir `console.log` con datos sensibles en builds de producción (usar Babel plugin `transform-remove-console`).

---

## 4️⃣ SOLUCIÓN AL PROBLEMA #1 DEL ANÁLISIS: SINCRONIZACIÓN OFFLINE-FIRST

Arquitectura para resolver las quejas de "no sincroniza", "pierde datos":

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│  UI (RN)    │ ──> │  SQLite local    │ ──> │  Cola de    │
│  Zustand    │     │  (fuente de      │     │  sync       │
│  state      │     │  verdad local)   │     │  pendiente  │
└─────────────┘     └──────────────────┘     └──────┬──────┘
                                                       │
                                              NetInfo detecta conexión
                                                       │
                                                       ▼
                                            ┌────────────────────┐
                                            │  Backend (Supabase/ │
                                            │  API propia)        │
                                            └────────────────────┘
```

**Reglas de implementación:**
1. Toda escritura (nuevo entrenamiento, comida registrada) se guarda primero en SQLite local → la UI nunca espera al backend.
2. Cada registro tiene un `sync_status`: `pending | synced | conflict`.
3. `NetInfo` detecta reconexión y dispara sincronización automática en background (`expo-task-manager` + `expo-background-fetch`).
4. Resolución de conflictos: estrategia "last write wins" con timestamp, o merge manual si son datos críticos (peso corporal).
5. Indicador visual claro en la UI: ícono de "sincronizando" / "sincronizado" / "error, reintentando" — resuelve directamente la queja de usuarios que no sabían si sus datos se habían guardado.

---

## 5️⃣ ARQUITECTURA DE CARPETAS SUGERIDA

```
app/                        # Expo Router (rutas = pantallas)
  (auth)/
    login.tsx
    register.tsx
  (tabs)/
    home.tsx
    workouts.tsx
    nutrition.tsx
    profile.tsx
  _layout.tsx

src/
  components/                # Componentes reutilizables (UI pura)
  features/                  # Lógica agrupada por dominio
    auth/
      hooks/
      services/
      store/
    workouts/
    nutrition/
    sync/
  services/
    api/                     # Cliente HTTP (axios/fetch + interceptores)
    storage/
      secureStorage.ts       # Wrapper de expo-secure-store
      database.ts            # Configuración SQLite/Drizzle
  hooks/                     # Hooks compartidos
  utils/
  types/
  constants/

eas.json                     # Configuración de builds (dev/preview/prod)
app.config.ts                # Config de Expo (con variables de entorno)
```

**Principio clave:** separar `features/` por dominio (no por tipo de archivo) facilita escalar el equipo y hace que cada módulo (auth, sync, nutrition) sea testeable de forma aislada.

---

## 6️⃣ GAMIFICACIÓN Y MOTIVACIÓN (Respuesta al problema #4 del análisis)

- Modelar logros como tabla independiente en el backend (`achievements`, `user_achievements`) para poder añadir nuevos sin release de app.
- Notificaciones push con `expo-notifications`, pero **con permiso explícito y valor real** (no spam) — los usuarios se quejaron de fatiga de notificaciones en otras apps.
- Rachas (streaks) calculadas en backend, no en cliente, para evitar manipulación.

---

## 7️⃣ BUENAS PRÁCTICAS GENERALES DE DESARROLLO

### Calidad de código
- TypeScript en modo `strict: true` desde el día uno.
- ESLint + Prettier con reglas compartidas (`eslint-config-expo`).
- Husky + lint-staged para bloquear commits con errores de lint/tipos.

### Testing
- **Jest + React Native Testing Library** para lógica de componentes y hooks.
- **Detox** o **Maestro** para tests E2E de flujos críticos (login, registro de comida, sincronización).
- Mockear `expo-secure-store` y llamadas de red en tests unitarios.

### CI/CD
- **EAS Build** para builds automatizados de iOS/Android.
- **EAS Update** para OTA updates de JS sin pasar por revisión de tienda (solo cambios de JS, no nativos).
- Pipeline sugerido: lint → type-check → tests → build preview → build producción (manual gate).

### Manejo de errores
- Sentry o Bugsnag para crash reporting (con scrubbing de PII antes de enviar).
- Error boundaries en React para evitar pantallas blancas.
- Logging estructurado en backend, nunca en el cliente para datos sensibles.

### Performance
- `FlashList` (Shopify) en lugar de `FlatList` para listas largas (historial de entrenamientos).
- Memoización (`useMemo`, `React.memo`) en gráficos de progreso pesados.
- Lazy loading de pantallas poco usadas con Expo Router.

---

## 8️⃣ CHECKLIST PRE-LANZAMIENTO (SEGURIDAD)

- [ ] Todos los tokens sensibles en `expo-secure-store`, nunca en `AsyncStorage`
- [ ] HTTPS forzado en todos los entornos de producción
- [ ] Variables de entorno gestionadas vía EAS Secrets, no hardcodeadas
- [ ] Rate limiting activo en endpoints de auth
- [ ] Refresh token rotation implementado
- [ ] Pantalla de consentimiento de privacidad (GDPR/CCPA) en onboarding
- [ ] Endpoint de exportación y eliminación de cuenta funcionando
- [ ] `console.log` removidos de builds de producción
- [ ] Apple Sign-In implementado (si hay login social en iOS)
- [ ] Crash reporting configurado sin exponer PII
- [ ] Tests E2E cubriendo login, logout y expiración de sesión

---

## 📎 REFERENCIA CRUZADA CON EL ANÁLISIS ORIGINAL

| Problema detectado en usuarios | Sección de este documento |
|---|---|
| Fallos de sincronización (Fitbit, Strong) | §4 Offline-first |
| Base de datos de alimentos inconsistente | Backend + validación (§3.3) — requiere diseño de API, fuera del alcance de RN |
| Interfaz desactualizada / anuncios excesivos | Decisión de producto, no cubierta aquí — ver documento original §3 |
| Falta de comunidad/motivación | §6 Gamificación |
| Preocupación por privacidad (Strava) | §3.4 Privacidad |
| Falta de soporte al cliente | Decisión de producto/operaciones, no técnica |

