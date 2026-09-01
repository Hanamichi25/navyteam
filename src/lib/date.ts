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
