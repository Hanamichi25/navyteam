import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { useExercises } from '@/features/exercises';

import { useRoutine } from '../hooks/useRoutines';
import { RoutineBlockList } from './RoutineBlockList';

interface AssignedRoutineViewProps {
  routineId: string;
  /** Días de la semana en formato corto (ej: "Lun/Mié/Vie"), si se conoce. */
  schedule?: string;
  /** Nombre denormalizado, para mostrar algo mientras carga el detalle. */
  fallbackName?: string;
  /** Oculta la cabecera (nombre + horario) — útil cuando el contenedor ya la muestra. */
  hideHeader?: boolean;
}

/**
 * Vista de solo lectura de una rutina asignada: cabecera + bloques de ejercicio.
 * Resuelve el detalle de la rutina (`useRoutine`) y los nombres de ejercicio
 * (`useExercises`) por su cuenta.
 */
export function AssignedRoutineView({
  routineId,
  schedule,
  fallbackName,
  hideHeader = false,
}: AssignedRoutineViewProps): React.JSX.Element {
  const routine = useRoutine(routineId);
  const exercises = useExercises();

  const exerciseNameById = useMemo(() => {
    const map = new Map<string, string>();
    if (exercises.status === 'ready') {
      for (const exercise of exercises.data) map.set(exercise.id, exercise.name);
    }
    return map;
  }, [exercises]);

  const name =
    routine.status === 'ready' ? routine.data.name : (fallbackName ?? 'Rutina');

  return (
    <View className="gap-3">
      {hideHeader ? null : (
        <View>
          <Text className="text-lg font-bold text-ink">{name}</Text>
          {schedule ? (
            <Text className="mt-0.5 text-sm text-ink-muted">{schedule}</Text>
          ) : null}
        </View>
      )}

      {routine.status === 'loading' ? (
        <Text className="text-sm text-ink-faint">Cargando rutina…</Text>
      ) : routine.status === 'error' ? (
        <Text className="text-sm text-ink-muted">
          No se pudo cargar esta rutina. Habla con tu entrenador.
        </Text>
      ) : routine.data.blocks.length === 0 ? (
        <Text className="text-sm text-ink-muted">
          Esta rutina todavía no tiene ejercicios.
        </Text>
      ) : (
        <RoutineBlockList
          blocks={routine.data.blocks}
          exerciseNameById={exerciseNameById}
        />
      )}
    </View>
  );
}
