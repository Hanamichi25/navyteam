/**
 * Espejo en TS de los tokens de color de `tailwind.config.js`, para los sitios
 * que no pueden usar `className` (prop `color` de `Ionicons`, `ActivityIndicator`,
 * `react-native-gifted-charts`). Mantener en sync manualmente con el theme.
 */
export const COLORS = {
  primary: '#1D74B8',
  primaryDark: '#155A91',
  primaryLight: '#E8F3FB',
  gold: '#C08A2E',
  goldDark: '#9C6F1F',
  goldLight: '#FBF3E4',
  ink: '#0F172A',
  inkMuted: '#64748B',
  inkFaint: '#94A3B8',
  surface: '#FFFFFF',
  surfaceSubtle: '#F8FAFC',
  surfaceField: '#F1F5F9',
  line: '#E2E8F0',
} as const;
