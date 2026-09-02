/**
 * Helpers compartidos por los formularios de registro de entrenamiento
 * (`SessionLoggerForm` — registro manual — y `ActiveSessionForm` — entreno en
 * curso con cronómetro). Lógica pura: sin React, sin I/O.
 */

import { createId } from '@/lib/id';
import type { RoutineBlock } from '@/types/routine';
import type { WorkoutSessionInput } from '@/types/workout';

/** Serie en edición dentro de un formulario de registro (campos vacíos = `null`). */
export interface DraftSet {
  key: string;
  reps: number | null;
  weightKg: number | null;
  rpe: number | null;
}

/** Ejercicio en edición: sus series y la metadata del bloque de la rutina. */
export interface DraftExercise {
  blockId: string;
  exerciseId: string;
  exerciseName: string;
  sets: DraftSet[];
}

/** Primer número de un texto de carga libre ("40 kg" → 40, "Peso corporal" → null). */
export function parseLeadingWeight(suggestedLoad: string): number | null {
  const match = /^\s*(\d+)/.exec(suggestedLoad);
  return match ? Number(match[1]) : null;
}

/** Serie nueva con reps/peso prellenados (o vacíos). */
export function newSet(reps: number | null, weightKg: number | null): DraftSet {
  return { key: createId('set'), reps, weightKg, rpe: null };
}

/** Prellena una grilla de series a partir de los bloques de una rutina. */
export function draftsFromBlocks(
  blocks: RoutineBlock[],
  nameById: Map<string, string>,
): DraftExercise[] {
  return blocks.map((block) => {
    const targetReps = Math.round((block.repsMin + block.repsMax) / 2);
    const targetWeight = parseLeadingWeight(block.suggestedLoad);
    return {
      blockId: block.id,
      exerciseId: block.exerciseId,
      exerciseName: nameById.get(block.exerciseId) ?? 'Ejercicio',
      sets: Array.from({ length: Math.max(block.sets, 1) }, () =>
        newSet(targetReps, targetWeight),
      ),
    };
  });
}

/** Convierte los borradores a `exercises` del input, descartando series/ejercicios vacíos. */
export function toInputExercises(
  drafts: DraftExercise[],
): WorkoutSessionInput['exercises'] {
  return drafts
    .map((draft) => ({
      exerciseId: draft.exerciseId,
      exerciseName: draft.exerciseName,
      sets: draft.sets
        .filter((set) => set.reps !== null && set.reps > 0)
        .map((set, i) => ({
          setNumber: i + 1,
          reps: set.reps as number,
          weightKg: set.weightKg ?? 0,
          ...(set.rpe === null ? {} : { rpe: set.rpe }),
        })),
    }))
    .filter((exercise) => exercise.sets.length > 0);
}
