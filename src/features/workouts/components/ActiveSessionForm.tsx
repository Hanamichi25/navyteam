import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { FeedbackState } from '@/components/FeedbackState';
import { useExercises } from '@/features/exercises';
import { useRoutine } from '@/features/routines';
import { confirm } from '@/lib/confirm';
import { todayDdMmAaaa } from '@/lib/date';
import type { RoutineBlock } from '@/types/routine';

import { useCreateWorkoutSession } from '../hooks/useWorkouts';
import { formatStopwatch, useStopwatch } from '../hooks/useStopwatch';
import {
  draftsFromBlocks,
  newSet,
  toInputExercises,
  type DraftExercise,
  type DraftSet,
} from '../logging';
import { ActiveSetRow } from './ActiveSetRow';

interface ActiveSessionFormProps {
  clientId: string;
  routineId: string;
  /** Se llama tras guardar el entreno (la pantalla navega fuera). */
  onDone: () => void;
  /** Se llama al descartar el entreno sin guardar. */
  onDiscard: () => void;
}

function repsLabel(block: RoutineBlock): string {
  return block.repsMin === block.repsMax
    ? `${block.repsMin}`
    : `${block.repsMin}–${block.repsMax}`;
}

function targetHint(block: RoutineBlock): string {
  const parts: string[] = [];
  if (block.suggestedLoad) parts.push(block.suggestedLoad);
  parts.push(`${block.restSec} s de descanso`);
  return `Objetivo: ${parts.join(' · ')}`;
}

/**
 * Entreno en curso: el cliente arranca desde su rutina de hoy, el cronómetro
 * corre, va marcando cada serie y anotando reps/peso, y al finalizar se guarda
 * la sesión con su duración. Comparte helpers con `SessionLoggerForm`.
 */
export function ActiveSessionForm({
  clientId,
  routineId,
  onDone,
  onDiscard,
}: ActiveSessionFormProps): React.JSX.Element {
  const routine = useRoutine(routineId);
  const exercises = useExercises();
  const createSession = useCreateWorkoutSession();
  const { elapsedSec, running, toggle } = useStopwatch();

  const nameById = useMemo(() => {
    const map = new Map<string, string>();
    if (exercises.status === 'ready') {
      for (const exercise of exercises.data) map.set(exercise.id, exercise.name);
    }
    return map;
  }, [exercises]);

  const blockById = useMemo(() => {
    const map = new Map<string, RoutineBlock>();
    if (routine.status === 'ready') {
      for (const block of routine.data.blocks) map.set(block.id, block);
    }
    return map;
  }, [routine]);

  const [drafts, setDrafts] = useState<DraftExercise[]>([]);
  const [doneKeys, setDoneKeys] = useState<Set<string>>(() => new Set());
  const [formError, setFormError] = useState<string | null>(null);
  const seeded = useRef(false);

  useEffect(() => {
    if (seeded.current) return;
    if (routine.status !== 'ready' || exercises.status !== 'ready') return;
    seeded.current = true;
    setDrafts(draftsFromBlocks(routine.data.blocks, nameById));
  }, [routine, exercises.status, nameById]);

  const patchSet = (
    blockId: string,
    key: string,
    patch: Partial<Omit<DraftSet, 'key'>>,
  ): void => {
    setDrafts((prev) =>
      prev.map((draft) =>
        draft.blockId !== blockId
          ? draft
          : {
              ...draft,
              sets: draft.sets.map((set) =>
                set.key === key ? { ...set, ...patch } : set,
              ),
            },
      ),
    );
  };

  const addSet = (blockId: string): void => {
    setDrafts((prev) =>
      prev.map((draft) => {
        if (draft.blockId !== blockId) return draft;
        const last = draft.sets[draft.sets.length - 1];
        return {
          ...draft,
          sets: [...draft.sets, newSet(last?.reps ?? null, last?.weightKg ?? null)],
        };
      }),
    );
  };

  const toggleDone = (key: string): void => {
    setDoneKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const totalSets = drafts.reduce((n, draft) => n + draft.sets.length, 0);
  const doneCount = drafts.reduce(
    (n, draft) => n + draft.sets.filter((set) => doneKeys.has(set.key)).length,
    0,
  );
  const progressPct = totalSets === 0 ? 0 : Math.round((doneCount / totalSets) * 100);

  const submit = async (): Promise<void> => {
    if (routine.status !== 'ready') return;
    const inputExercises = toInputExercises(drafts);
    if (inputExercises.length === 0) {
      setFormError('Anota las reps de al menos una serie para guardar el entreno.');
      return;
    }
    setFormError(null);
    await createSession.mutateAsync({
      clientId,
      routineId,
      routineName: routine.data.name,
      date: todayDdMmAaaa(),
      durationMin: Math.max(1, Math.round(elapsedSec / 60)),
      exercises: inputExercises,
    });
    onDone();
  };

  const confirmDiscard = (): void => {
    confirm(
      {
        title: 'Salir del entreno',
        message: 'Perderás las series que hayas anotado. ¿Seguro que quieres salir?',
        confirmLabel: 'Salir',
        destructive: true,
      },
      onDiscard,
    );
  };

  return (
    <View className="flex-1">
      {/* Cabecera con cronómetro */}
      <View className="gap-2 border-b border-line bg-primary-light px-5 pb-4 pt-3">
        <View className="flex-row items-center justify-between">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Salir del entreno"
            onPress={confirmDiscard}
            className="flex-row items-center gap-1.5"
          >
            <Ionicons name="close" size={18} color="#64748B" />
            <Text className="text-sm font-medium text-ink-muted">Salir</Text>
          </Pressable>

          <Text className="text-xs font-bold uppercase tracking-wide text-primary">
            Entreno en curso
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={running ? 'Pausar cronómetro' : 'Reanudar cronómetro'}
            onPress={toggle}
            className="flex-row items-center gap-1.5"
          >
            <Ionicons name={running ? 'pause' : 'play'} size={15} color="#2563EB" />
            <Text className="text-sm font-bold text-primary">
              {running ? 'Pausar' : 'Reanudar'}
            </Text>
          </Pressable>
        </View>

        <View className="flex-row items-center justify-center gap-2.5">
          <View
            className={`h-2.5 w-2.5 rounded-full ${
              running ? 'bg-emerald-500' : 'bg-ink-faint'
            }`}
          />
          <Text className="text-4xl font-extrabold text-ink">
            {formatStopwatch(elapsedSec)}
          </Text>
        </View>

        <Text className="text-center text-sm text-ink-muted">
          {routine.status === 'ready' ? routine.data.name : 'Cargando rutina…'}
          {drafts.length > 0 ? ` · ${drafts.length} ejercicios` : ''}
        </Text>
      </View>

      {routine.status === 'loading' || exercises.status === 'loading' ? (
        <FeedbackState variant="loading" />
      ) : routine.status === 'error' ? (
        <FeedbackState
          variant="error"
          message="No se pudo cargar esta rutina. Habla con tu entrenador."
        />
      ) : (
        <>
          <ScrollView
            className="flex-1"
            contentContainerClassName="gap-5 px-5 pb-6 pt-4"
            showsVerticalScrollIndicator={false}
          >
            {/* Progreso */}
            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-bold uppercase tracking-wide text-ink-faint">
                  Series completadas
                </Text>
                <Text className="text-xs font-semibold text-ink-muted">
                  {doneCount} de {totalSets}
                </Text>
              </View>
              <View className="h-1.5 overflow-hidden rounded-full bg-line">
                <View
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${progressPct}%` }}
                />
              </View>
            </View>

            {drafts.map((draft, exerciseIndex) => {
              const block = blockById.get(draft.blockId);
              return (
                <View
                  key={draft.blockId}
                  className="gap-3 rounded-2xl border border-line bg-surface-subtle p-4"
                >
                  <View className="flex-row items-center gap-2.5">
                    <View className="h-6 w-6 items-center justify-center rounded-full bg-primary-light">
                      <Text className="text-xs font-bold text-primary">
                        {exerciseIndex + 1}
                      </Text>
                    </View>
                    <Text className="flex-1 text-sm font-bold text-ink">
                      {draft.exerciseName}
                    </Text>
                    {block ? (
                      <Text className="text-xs font-semibold text-ink-faint">
                        {block.sets} × {repsLabel(block)}
                      </Text>
                    ) : null}
                  </View>

                  {block ? (
                    <Text className="text-xs text-ink-muted">{targetHint(block)}</Text>
                  ) : null}

                  <View className="flex-row items-center gap-2">
                    <Text className="w-5 text-center text-xs font-semibold text-ink-faint">#</Text>
                    <Text className="flex-1 text-center text-xs font-semibold text-ink-faint">Reps</Text>
                    <Text className="flex-1 text-center text-xs font-semibold text-ink-faint">Kg</Text>
                    <Text className="w-11 text-center text-xs font-semibold text-ink-faint">✓</Text>
                  </View>

                  {draft.sets.map((set, index) => (
                    <ActiveSetRow
                      key={set.key}
                      index={index}
                      set={set}
                      done={doneKeys.has(set.key)}
                      onChange={(patch) => patchSet(draft.blockId, set.key, patch)}
                      onToggleDone={() => toggleDone(set.key)}
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
              );
            })}

            {formError ? (
              <Text className="text-sm text-red-500">{formError}</Text>
            ) : null}

            <Text className="text-center text-xs text-ink-faint">
              El cronómetro corre desde que iniciaste. Al finalizar se guarda la
              duración junto con la sesión.
            </Text>
          </ScrollView>

          <View className="border-t border-line px-5 py-3">
            <Button
              label={`Finalizar entreno · ${formatStopwatch(elapsedSec)}`}
              fullWidth
              loading={createSession.isPending}
              onPress={submit}
            />
          </View>
        </>
      )}
    </View>
  );
}
