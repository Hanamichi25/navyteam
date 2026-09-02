/**
 * Parseo de los strings de horario tipo `"Lun/Mié/Vie"` que llevan las rutinas
 * asignadas (`AssignedRoutine.schedule`, generado en `assign-routine.tsx` con los
 * tokens `Lun Mar Mié Jue Vie Sáb Dom` unidos por `/`).
 *
 * Todos los índices son lunes = 0 … domingo = 6, igual que `weekdayIndexMonday`.
 */

const DAY_INDEX: Record<string, number> = {
  lun: 0,
  mar: 1,
  mie: 2,
  jue: 3,
  vie: 4,
  sab: 5,
  dom: 6,
};

function normalizeToken(token: string): string {
  return token
    .trim()
    .toLowerCase()
    .replace(/á/g, 'a')
    .replace(/é/g, 'e')
    .replace(/í/g, 'i')
    .replace(/ó/g, 'o')
    .replace(/ú/g, 'u')
    .slice(0, 3);
}

/** Índices de día (lunes = 0) que aparecen en un horario. Ordenados y sin repetir. */
export function parseSchedule(schedule: string): number[] {
  const found = new Set<number>();
  for (const part of schedule.split(/[\s,/·|-]+/)) {
    const index = DAY_INDEX[normalizeToken(part)];
    if (index !== undefined) found.add(index);
  }
  return [...found].sort((a, b) => a - b);
}

/** `true` si el horario incluye ese día de la semana (lunes = 0). */
export function scheduleTrainsOn(schedule: string, weekdayIndex: number): boolean {
  return parseSchedule(schedule).includes(weekdayIndex);
}

/**
 * Índice del próximo día de entrenamiento a partir de `fromWeekdayIndex`
 * (sin incluirlo), mirando todos los horarios juntos. `null` si no hay ninguno.
 */
export function nextTrainingWeekday(
  schedules: readonly string[],
  fromWeekdayIndex: number,
): number | null {
  const days = new Set<number>();
  for (const schedule of schedules) {
    for (const day of parseSchedule(schedule)) days.add(day);
  }
  if (days.size === 0) return null;

  for (let step = 1; step <= 7; step += 1) {
    const index = (fromWeekdayIndex + step) % 7;
    if (days.has(index)) return index;
  }
  return null;
}
