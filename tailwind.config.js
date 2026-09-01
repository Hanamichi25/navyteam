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
        primary: {
          DEFAULT: '#2563EB',
          dark: '#1D4ED8',
          light: '#EFF3FF',
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
    },
  },
  plugins: [],
};
