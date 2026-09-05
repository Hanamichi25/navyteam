/**
 * Helpers para el formato de fecha `dd/mm/aaaa` usado por `DateField` (sin
 * date-picker nativo todavía, ver `src/components/DateField.tsx`).
 */

/** Parsea `dd/mm/aaaa` a `Date`, o `null` si el texto no tiene esa forma. */
export function parseDdMmAaaa(value: string): Date | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);

  // Rechaza fechas "desbordadas" (ej: 31/02/2025 → new Date las corrige a marzo).
  if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
    return null;
  }
  return date;
}

/** Edad en años a partir de una fecha de nacimiento `dd/mm/aaaa`, o `null` si es inválida. */
export function computeAge(birthDate: string): number | null {
  const parsed = parseDdMmAaaa(birthDate);
  if (!parsed) return null;

  const today = new Date();
  let age = today.getFullYear() - parsed.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > parsed.getMonth() ||
    (today.getMonth() === parsed.getMonth() && today.getDate() >= parsed.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
}

/** Fecha de hoy en formato `dd/mm/aaaa`, para prellenar `DateField`. */
export function todayDdMmAaaa(): string {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${today.getFullYear()}`;
}

/** `Date` → `dd/mm/aaaa`. */
export function formatDdMmAaaa(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${date.getFullYear()}`;
}

/** Suma `n` meses a una fecha (ajusta al último día del mes si hace falta). */
export function addMonths(date: Date, n: number): Date {
  const result = new Date(date.getFullYear(), date.getMonth() + n, date.getDate());
  // Si el día se desbordó (ej: 31/01 + 1 mes), retrocede al último día del mes previo.
  if (result.getDate() !== date.getDate()) result.setDate(0);
  return result;
}

const DIAS_CORTOS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MESES_CORTOS = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
];

/** Etiqueta corta de la fecha de hoy en español (ej: "lun 1 sep"). Sin depender de `Intl`. */
export function todayShortLabel(): string {
  const today = new Date();
  return `${DIAS_CORTOS[today.getDay()]} ${today.getDate()} ${MESES_CORTOS[today.getMonth()]}`;
}

/** Mes y día de una fecha `dd/mm/aaaa` en formato corto (ej: {day:"2", month:"sep"}), o `null`. */
export function monthDayShort(value: string): { day: string; month: string } | null {
  const date = parseDdMmAaaa(value);
  if (!date) return null;
  return { day: String(date.getDate()), month: MESES_CORTOS[date.getMonth()] ?? '' };
}

/** `dd/mm/aaaa` → `aaaa-mm-dd` (columna `date` de Postgres), o `null` si no tiene esa forma. */
export function ddmmaaaaToIso(value: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
}

/** `aaaa-mm-dd` (o ISO completo) → `dd/mm/aaaa`. Devuelve el valor tal cual si no encaja. */
export function isoToDdmmaaaa(value: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : value;
}

const MESES_MEMBER_SINCE = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];

/** `Date` → "Ene 2025" (mes de alta del cliente, para `ClientDetail.memberSince`). */
export function formatMemberSince(date: Date): string {
  return `${MESES_MEMBER_SINCE[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Etiqueta relativa corta para "última actividad" del cliente: "Hoy", "Ayer",
 * "Hace 3 días", "Hace 2 semanas", o `fallback` si no hay fecha. Derivada del
 * día del calendario, no de las horas exactas.
 */
export function relativeDayLabel(date: Date | null, fallback = 'Sin actividad aún'): string {
  if (!date) return fallback;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const days = Math.round((startOfToday.getTime() - startOfDate.getTime()) / 86_400_000);

  if (days <= 0) return 'Hoy';
  if (days === 1) return 'Ayer';
  if (days < 7) return `Hace ${days} días`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return weeks === 1 ? 'Hace 1 semana' : `Hace ${weeks} semanas`;
  }
  const months = Math.floor(days / 30);
  return months === 1 ? 'Hace 1 mes' : `Hace ${months} meses`;
}

/** Días de la semana con lunes = 0 … domingo = 6 (el orden que usan los horarios). */
export const WEEKDAYS_ES = [
  'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo',
] as const;

/** Iniciales de los 7 días, lunes primero. */
export const WEEKDAY_LETTERS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'] as const;

const MESES_LARGOS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/** Índice del día de la semana con lunes = 0 … domingo = 6. */
export function weekdayIndexMonday(date: Date = new Date()): number {
  return (date.getDay() + 6) % 7;
}

/** Nombre del día de la semana en español, lunes = 0 … domingo = 6. */
export function weekdayNameEs(weekdayIndex: number): string {
  return WEEKDAYS_ES[weekdayIndex] ?? WEEKDAYS_ES[0];
}

/** Etiqueta larga de la fecha de hoy en español (ej: "Miércoles 3 · septiembre"). */
export function todayLongLabel(): string {
  const d = new Date();
  const dia = weekdayNameEs(weekdayIndexMonday(d));
  const mes = MESES_LARGOS[d.getMonth()] ?? '';
  return `${dia.charAt(0).toUpperCase()}${dia.slice(1)} ${d.getDate()} · ${mes}`;
}
