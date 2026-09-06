import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { DateField } from '@/components/DateField';
import { FeedbackState } from '@/components/FeedbackState';
import { TextField } from '@/components/TextField';
import { useClient } from '@/features/clients';
import { useExercises } from '@/features/exercises';
import { useRoutine } from '@/features/routines';
import { parseDdMmAaaa, todayDdMmAaaa } from '@/lib/date';
import { useCreateWorkoutSession } from '../hooks/useWorkouts';
import {
  draftsFromBlocks,
  newSet,
  toInputExercises,
  type DraftExercise,
  type DraftSet,
} from '../logging';
import { SetRow } from './SetRow';

interface SessionLoggerFormProps {
  clientId: string;
  /** Se llama tras guardar la sesión (la pantalla cierra el modal). */
  onDone: () => void;
  /** Mensaje cuando el cliente no tiene rutinas asignadas (varía coach/cliente). */
  emptyMessage?: string;
}

/**
 * Formulario de registro de una sesión de entrenamiento. El entrenador elige
 * una rutina asignada al cliente y ajusta las series realizadas por ejercicio
 * (prellenadas desde los objetivos de la rutina).
 */
export function SessionLoggerForm({
  clientId,
  onDone,
  emptyMessage = 'Este cliente no tiene rutinas asignadas. Asígnale una desde la pestaña Rutinas para registrar una sesión.',
}: SessionLoggerFormProps): React.JSX.Element {
  const client = useClient(clientId);
  const exercises = useExercises();
  const createSession = useCreateWorkoutSession();

  const assignedRoutines = client.status === 'ready' ? client.data.assignedRoutines : [];
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(null);

  // Preselecciona si el cliente tiene exactamente una rutina asignada.
  useEffect(() => {
    if (selectedRoutineId === null && assignedRoutines.length === 1) {
      setSelectedRoutineId(assignedRoutines[0]!.id);
    }
  }, [assignedRoutines, selectedRoutineId]);

  const routineEnabled = selectedRoutineId !== null;
  const routine = useRoutine(selectedRoutineId ?? '', routineEnabled);

  // `toAsyncState` devuelve un objeto nuevo por render; nos quedamos con los
  // datos crudos (que sí son referencia estable de React Query) para que los
  // efectos de abajo no se re-ejecuten en bucle.
  const exerciseList = exercises.status === 'ready' ? exercises.data : null;
  const routineBlocks = routine.status === 'ready' ? routine.data.blocks : null;

  const nameById = useMemo(() => {
    const map = new Map<string, string>();
    if (exerciseList) {
      for (const exercise of exerciseList) map.set(exercise.id, exercise.name);
    }
    return map;
  }, [exerciseList]);

  const [date, setDate] = useState(todayDdMmAaaa());
  const [notes, setNotes] = useState('');
  const [drafts, setDrafts] = useState<DraftExercise[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const seededFor = useRef<string | null>(null);

  useEffect(() => {
    if (!routineEnabled) {
      seededFor.current = null;
      // `[]` nuevo cada vez → sin este guard el efecto se re-dispara en bucle
      // (deps con `nameById`) cuando no hay rutina seleccionada.
      setDrafts((prev) => (prev.length === 0 ? prev : []));
      return;
    }
    if (!routineBlocks || !exerciseList) return;
    if (seededFor.current === selectedRoutineId) return;
    seededFor.current = selectedRoutineId;
    setDrafts(draftsFromBlocks(routineBlocks, nameById));
  }, [routineEnabled, routineBlocks, exerciseList, selectedRoutineId, nameById]);

  const patchSet = (blockId: string, key: string, patch: Partial<Omit<DraftSet, 'key'>>): void => {
    setDrafts((prev) =>
      prev.map((draft) =>
        draft.blockId !== blockId
          ? draft
          : { ...draft, sets: draft.sets.map((set) => (set.key === key ? { ...set, ...patch } : set)) },
      ),
    );
  };

  const addSet = (blockId: string): void => {
    setDrafts((prev) =>
      prev.map((draft) => {
        if (draft.blockId !== blockId) return draft;
        const last = draft.sets[draft.sets.length - 1];
        return { ...draft, sets: [...draft.sets, newSet(last?.reps ?? null, last?.weightKg ?? null)] };
      }),
    );
  };

  const removeSet = (blockId: string, key: string): void => {
    setDrafts((prev) =>
      prev.map((draft) =>
        draft.blockId !== blockId
          ? draft
          : { ...draft, sets: draft.sets.filter((set) => set.key !== key) },
      ),
    );
  };

  const submit = async (): Promise<void> => {
    if (!selectedRoutineId || routine.status !== 'ready') return;
    if (parseDdMmAaaa(date) === null) {
      setFormError('Usa el formato dd/mm/aaaa en la fecha.');
      return;
    }
    const inputExercises = toInputExercises(drafts);
    if (inputExercises.length === 0) {
      setFormError('Registra al menos una serie con repeticiones.');
      return;
    }
    setFormError(null);
    await createSession.mutateAsync({
      clientId,
      routineId: selectedRoutineId,
      routineName: routine.data.name,
      date,
      ...(notes.trim() ? { notes: notes.trim() } : {}),
      exercises: inputExercises,
    });
    onDone();
  };

  if (client.status === 'loading') return <FeedbackState variant="loading" />;
  if (client.status === 'error') return <FeedbackState variant="error" message={client.error} />;

  if (assignedRoutines.length === 0) {
    return (
      <FeedbackState variant="empty" iconName="clipboard-outline" message={emptyMessage} />
    );
  }

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-5 pt-2 pb-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-2">
          <Text className="text-sm font-semibold text-ink">Rutina</Text>
          {assignedRoutines.map((assigned) => {
            const active = assigned.id === selectedRoutineId;
            return (
              <Pressable
                key={assigned.id}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setSelectedRoutineId(assigned.id)}
                className={`rounded-2xl border p-3 ${
                  active ? 'border-primary bg-primary-light' : 'border-line bg-surface'
                }`}
              >
                <Text className="text-sm font-bold text-ink">{assigned.name}</Text>
                <Text className="mt-0.5 text-xs text-ink-faint">
                  {assigned.schedule} · {assigned.exerciseCount} ejercicios
                </Text>
              </Pressable>
            );
          })}
        </View>

        {routineEnabled ? (
          <RoutineBodyGate routineStatus={routine.status} error={routine.error}>
            <DateField label="Fecha" value={date} onChangeText={setDate} />

            {drafts.map((draft) => (
              <View key={draft.blockId} className="gap-3 rounded-2xl border border-line bg-surface-subtle p-4">
                <Text className="text-sm font-bold text-ink">{draft.exerciseName}</Text>

                <View className="flex-row items-center gap-2">
                  <Text className="w-5 text-center text-xs font-semibold text-ink-faint">#</Text>
                  <Text className="flex-1 text-center text-xs font-semibold text-ink-faint">Reps</Text>
                  <Text className="flex-1 text-center text-xs font-semibold text-ink-faint">Kg</Text>
                  <Text className="flex-1 text-center text-xs font-semibold text-ink-faint">RPE</Text>
                  <View className="w-8" />
                </View>

                {draft.sets.map((set, index) => (
                  <SetRow
                    key={set.key}
                    index={index}
                    set={set}
                    removable={draft.sets.length > 1}
                    onChange={(patch) => patchSet(draft.blockId, set.key, patch)}
                    onRemove={() => removeSet(draft.blockId, set.key)}
                  />
                ))}

                <Pressable
                  accessibilityRole="button"
                  onPress={() => addSet(draft.blockId)}
                  className="self-start rounded-full bg-primary-light px-3 py-1.5"
                >
                  <Text className="text-sm font-semibold text-primary">+ Serie</Text>
                </Pressable>
              </View>
            ))}

            <TextField
              label="Notas (opcional)"
              value={notes}
              onChangeText={setNotes}
              placeholder="Sensaciones, ajustes de técnica, etc."
              multiline
            />

            {formError ? <Text className="text-sm text-red-500">{formError}</Text> : null}
          </RoutineBodyGate>
        ) : (
          <Text className="text-sm text-ink-faint">Elige una rutina para registrar las series.</Text>
        )}
      </ScrollView>

      {routineEnabled && routine.status === 'ready' && drafts.length > 0 ? (
        <View className="border-t border-line px-5 py-3">
          <Button
            label="Guardar sesión"
            fullWidth
            loading={createSession.isPending}
            onPress={submit}
          />
        </View>
      ) : null}
    </View>
  );
}

/** Envuelve el cuerpo del formulario con los estados de carga/error de la rutina. */
function RoutineBodyGate({
  routineStatus,
  error,
  children,
}: {
  routineStatus: 'loading' | 'ready' | 'error';
  error: string | null;
  children: React.ReactNode;
}): React.JSX.Element {
  if (routineStatus === 'loading') {
    return <Text className="text-sm text-ink-faint">Cargando rutina…</Text>;
  }
  if (routineStatus === 'error') {
    return (
      <Text className="text-sm text-red-500">
        {error ?? 'No se pudo cargar esta rutina. Puede que haya sido eliminada.'}
      </Text>
    );
  }
  return <>{children}</>;
}
