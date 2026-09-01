import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState, type ReactNode } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { ChipGroup } from '@/components/ChipGroup';
import { FeedbackState } from '@/components/FeedbackState';
import { NumberField } from '@/components/NumberField';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SelectField } from '@/components/SelectField';
import { TextField } from '@/components/TextField';
import {
  ExerciseListItem,
  MUSCLE_GROUP_FILTERS,
  useExercises,
  type MuscleGroupFilter,
} from '@/features/exercises';
import { createId } from '@/lib/id';
import type { RoutineBlock, RoutineInput } from '@/types/routine';
import { ROUTINE_CATEGORY_OPTIONS, ROUTINE_LEVEL_OPTIONS } from '../labels';
import { routineMetaSchema, type RoutineMetaFormValues } from '../validation';
import { ExerciseBlockRow } from './ExerciseBlockRow';

interface RoutineEditorFormProps {
  initialValues?: RoutineInput;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (input: RoutineInput) => void | Promise<void>;
  /** Contenido extra bajo el botón principal, ej: eliminar en modo edición. */
  footer?: ReactNode;
}

const DEFAULT_BLOCK_SETTINGS = { sets: 3, repsMin: 8, repsMax: 12, restSec: 60, suggestedLoad: '' };

/** Formulario compartido del editor de rutina: metadata + bloques de ejercicio. */
export function RoutineEditorForm({
  initialValues,
  submitLabel,
  isSubmitting,
  onSubmit,
  footer,
}: RoutineEditorFormProps): React.JSX.Element {
  const exercises = useExercises();
  const [blocks, setBlocks] = useState<RoutineBlock[]>(initialValues?.blocks ?? []);
  const [blocksError, setBlocksError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerMuscleGroup, setPickerMuscleGroup] = useState<MuscleGroupFilter>('all');

  const exerciseNameById = useMemo(() => {
    const map = new Map<string, string>();
    if (exercises.status === 'ready') {
      for (const exercise of exercises.data) map.set(exercise.id, exercise.name);
    }
    return map;
  }, [exercises]);

  const pickerExercises = useMemo(() => {
    if (exercises.status !== 'ready') return [];
    if (pickerMuscleGroup === 'all') return exercises.data;
    return exercises.data.filter((exercise) => exercise.muscleGroup === pickerMuscleGroup);
  }, [exercises, pickerMuscleGroup]);

  const { control, handleSubmit } = useForm<RoutineMetaFormValues>({
    resolver: zodResolver(routineMetaSchema),
    defaultValues: {
      name: initialValues?.name ?? '',
      category: initialValues?.category ?? null,
      level: initialValues?.level ?? null,
      durationMin: initialValues?.durationMin ?? null,
    },
    mode: 'onTouched',
  });

  const addBlock = (exerciseId: string): void => {
    setBlocks((prev) => [...prev, { id: createId('blk'), exerciseId, ...DEFAULT_BLOCK_SETTINGS }]);
    setBlocksError(null);
    setPickerOpen(false);
  };

  const updateBlock = (index: number, block: RoutineBlock): void => {
    setBlocks((prev) => prev.map((b, i) => (i === index ? block : b)));
  };

  const removeBlock = (index: number): void => {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  };

  const moveBlock = (index: number, direction: -1 | 1): void => {
    setBlocks((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });
  };

  const submit = handleSubmit((values) => {
    if (blocks.length === 0) {
      setBlocksError('Añade al menos un ejercicio');
      return;
    }
    onSubmit({
      name: values.name,
      category: values.category!,
      level: values.level!,
      durationMin: values.durationMin!,
      blocks,
    });
  });

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-5 pt-2 pb-6"
        showsVerticalScrollIndicator={false}
      >
        <Controller
          control={control}
          name="name"
          render={({ field: { value, onChange, onBlur }, fieldState }) => (
            <TextField
              label="Nombre"
              placeholder="Piernas y Glúteos"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="category"
          render={({ field: { value, onChange }, fieldState }) => (
            <SelectField
              label="Categoría"
              options={ROUTINE_CATEGORY_OPTIONS}
              value={value}
              onChange={onChange}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="level"
          render={({ field: { value, onChange }, fieldState }) => (
            <SelectField
              label="Nivel"
              options={ROUTINE_LEVEL_OPTIONS}
              value={value}
              onChange={onChange}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="durationMin"
          render={({ field: { value, onChange, onBlur }, fieldState }) => (
            <NumberField
              label="Duración"
              placeholder="45"
              suffix="min"
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
            />
          )}
        />

        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-ink">Ejercicios</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setPickerOpen(true)}
              className="flex-row items-center gap-1.5 rounded-full bg-primary-light px-3 py-1.5"
            >
              <Text className="text-sm font-semibold text-primary">+ Añadir ejercicio</Text>
            </Pressable>
          </View>

          {blocks.length === 0 ? (
            <Text className="text-sm text-ink-faint">
              Todavía no añadiste ningún ejercicio.
            </Text>
          ) : (
            <View className="gap-3">
              {blocks.map((block, index) => (
                <ExerciseBlockRow
                  key={block.id}
                  block={block}
                  exerciseName={exerciseNameById.get(block.exerciseId) ?? 'Ejercicio no encontrado'}
                  isFirst={index === 0}
                  isLast={index === blocks.length - 1}
                  onChange={(next) => updateBlock(index, next)}
                  onMoveUp={() => moveBlock(index, -1)}
                  onMoveDown={() => moveBlock(index, 1)}
                  onRemove={() => removeBlock(index)}
                />
              ))}
            </View>
          )}

          {blocksError ? <Text className="text-sm text-red-500">{blocksError}</Text> : null}
        </View>
      </ScrollView>

      <View className="gap-3 border-t border-line px-5 py-3">
        <Button label={submitLabel} fullWidth loading={isSubmitting} onPress={submit} />
        {footer}
      </View>

      <Modal visible={pickerOpen} animationType="slide" onRequestClose={() => setPickerOpen(false)}>
        <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
          <ScreenHeader title="Elegir Ejercicio" centered onBack={() => setPickerOpen(false)} />

          <View className="pb-3">
            <ChipGroup
              options={MUSCLE_GROUP_FILTERS}
              value={pickerMuscleGroup}
              onChange={setPickerMuscleGroup}
            />
          </View>

          {exercises.status === 'loading' ? (
            <FeedbackState variant="loading" />
          ) : exercises.status === 'error' ? (
            <FeedbackState variant="error" message={exercises.error} />
          ) : pickerExercises.length === 0 ? (
            <FeedbackState variant="empty" message="No hay ejercicios en este grupo muscular." />
          ) : (
            <ScrollView contentContainerClassName="gap-3 px-5 pb-6" showsVerticalScrollIndicator={false}>
              {pickerExercises.map((exercise) => (
                <ExerciseListItem
                  key={exercise.id}
                  exercise={exercise}
                  onPress={() => addBlock(exercise.id)}
                />
              ))}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
}
