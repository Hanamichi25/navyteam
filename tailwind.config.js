/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  // La app es light-only en esta fase (app.json → userInterfaceStyle: "light").
  // NativeWind fuerza ese esquema en web y necesita darkMode 'class' (no 'media')
  // para poder fijarlo sin lanzar el error de color-scheme.
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Acento principal: azul cielo/mar abierto — el color de marca de
        // "NavyTeam". Suficiente contraste para texto blanco encima (botones
        // sólidos), pero más luminoso que un navy de uniforme.
        primary: {
          DEFAULT: '#1D74B8',
          dark: '#155A91',
          light: '#E8F3FB',
        },
        // Dorado ancla: el acento cálido de insignia/medalla — logros, PRs,
        // rachas, avisos de suscripción.
        gold: {
          DEFAULT: '#C08A2E',
          dark: '#9C6F1F',
          light: '#FBF3E4',
        },
        ink: {
          DEFAULT: '#0F172A',
          muted: '#64748B',
          faint: '#94A3B8',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          subtle: '#F8FAFC',
          field: '#F1F5F9',
        },
        line: '#E2E8F0',
      },
      fontFamily: {
        sans: ['Manrope_500Medium'],
        normal: ['Manrope_500Medium'],
        medium: ['Manrope_500Medium'],
        semibold: ['Manrope_600SemiBold'],
        bold: ['Manrope_700Bold'],
        extrabold: ['Manrope_800ExtraBold'],
      },
    },
  },
  // RN no sintetiza pesos de una fuente custom (cada peso de Manrope es un
  // archivo/familia distinta, cargado en app/_layout.tsx). Apagamos el plugin
  // core `fontWeight` de Tailwind (emitiría `fontWeight: '700'`, que RN
  // ignora sin una `fontFamily` que lo respalde) para que las mismas clases
  // `font-medium/semibold/bold/extrabold` resuelvan por `fontFamily` (arriba)
  // en vez de por `font-weight` — funciona igual en RN nativo y en RN-web.
  corePlugins: {
    fontWeight: false,
  },
  plugins: [],
};
