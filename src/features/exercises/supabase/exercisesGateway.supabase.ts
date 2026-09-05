import { createId } from '@/lib/id';
import { supabase } from '@/lib/supabase';
import { unwrapList, unwrapRequired } from '@/lib/supabaseQuery';
import type { Exercise, ExerciseInput, MuscleGroup } from '@/types/exercise';
import type { ExercisesGateway } from '../gateway';

/**
 * Implementación real de `ExercisesGateway` sobre Supabase (tabla `exercises`).
 * El catálogo es del coach (`coach_id = auth.uid()`, RLS); un cliente solo lo
 * lee para pintar los nombres de los ejercicios de su rutina asignada.
 */

interface ExerciseRow {
  id: string;
  name: string;
  muscle_group: string;
  equipment: string;
  description: string | null;
  media_url: string | null;
}

const COLUMNS = 'id, name, muscle_group, equipment, description, media_url';

function rowToExercise(row: ExerciseRow): Exercise {
  return {
    id: row.id,
    name: row.name,
    muscleGroup: row.muscle_group as MuscleGroup,
    equipment: row.equipment,
    ...(row.description ? { description: row.description } : {}),
    ...(row.media_url ? { mediaUrl: row.media_url } : {}),
  };
}

function inputToRow(input: Partial<ExerciseInput>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (input.name !== undefined) row.name = input.name;
  if (input.muscleGroup !== undefined) row.muscle_group = input.muscleGroup;
  if (input.equipment !== undefined) row.equipment = input.equipment;
  if (input.description !== undefined) row.description = input.description || null;
  if (input.mediaUrl !== undefined) row.media_url = input.mediaUrl || null;
  return row;
}

export function createSupabaseExercisesGateway(): ExercisesGateway {
  return {
    async list() {
      const rows = unwrapList(
        await supabase.from('exercises').select(COLUMNS).order('name'),
      );
      return rows.map(rowToExercise);
    },

    async create(input: ExerciseInput) {
      const row = unwrapRequired(
        await supabase
          .from('exercises')
          .insert({ id: createId('exc'), ...inputToRow(input) })
          .select(COLUMNS)
          .single(),
        'No se pudo crear el ejercicio',
      );
      return rowToExercise(row);
    },

    async update(id, input) {
      const row = unwrapRequired(
        await supabase
          .from('exercises')
          .update(inputToRow(input))
          .eq('id', id)
          .select(COLUMNS)
          .single(),
        `Ejercicio no encontrado: ${id}`,
      );
      return rowToExercise(row);
    },

    async remove(id) {
      const { error } = await supabase.from('exercises').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
  };
}
