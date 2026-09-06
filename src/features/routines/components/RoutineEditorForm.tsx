import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState, type ReactNode } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { NumberField } from '@/components/NumberField';
import { SelectField } from '@/components/SelectField';
import { TextField } from '@/components/TextField';
import { useExercises } from '@/features/exercises';
import { createId } from '@/lib/id';
import type { Exercise } from '@/types/exercise';
import type { RoutineBlock, RoutineInput } from '@/types/routine';
import { ROUTINE_CATEGORY_OPTIONS, ROUTINE_LEVEL_OPTIONS } from '../labels';
import { routineMetaSchema, type RoutineMetaFormValues } from '../validation';
import { ExerciseBlockCard } from './ExerciseBlockCard';
import { ExercisePickerModal } from './ExercisePickerModal';
import { RoutineSummaryCard } from './RoutineSummaryCard';

interface RoutineEditorFormProps {
  initialValues?: RoutineInput;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (input: RoutineInput) => void | Promise<void>;
  /** Contenido extra bajo el botón principal, ej: eliminar en modo edición. */
  footer?: ReactNode;
}

const DEFAULT_BLOCK_SETTINGS = { sets: 3, repsMin: 8, repsMax: 12, restSec: 60, suggestedLoad: '' };

/** Formulario compartido del editor de rutina: cabecera en vivo + metadata + bloques. */
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
  const [expandedId, setExpandedId] = useState<string | null>(
    initialValues?.blocks?.[0]?.id ?? null,
  );

  const exerciseById = useMemo(() => {
    const map = new Map<string, Exercise>();
    if (exercises.status === 'ready') {
      for (const exercise of exercises.data) map.set(exercise.id, exercise);
    }
    return map;
  }, [exercises]);

  const countByExerciseId = useMemo(() => {
    const map = new Map<string, number>();
    for (const block of blocks) {
      map.set(block.exerciseId, (map.get(block.exerciseId) ?? 0) + 1);
    }
    return map;
  }, [blocks]);

  const { control, handleSubmit, watch } = useForm<RoutineMetaFormValues>({
    resolver: zodResolver(routineMetaSchema),
    defaultValues: {
      name: initialValues?.name ?? '',
      category: initialValues?.category ?? null,
      level: initialValues?.level ?? null,
      durationMin: initialValues?.durationMin ?? null,
    },
    mode: 'onTouched',
  });

  const values = watch();
  const totalSets = blocks.reduce((sum, block) => sum + (block.sets || 0), 0);

  const addBlock = (exerciseId: string): void => {
    const id = createId('blk');
    setBlocks((prev) => [...prev, { id, exerciseId, ...DEFAULT_BLOCK_SETTINGS }]);
    setExpandedId(id);
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

  const submit = handleSubmit((formValues) => {
    if (blocks.length === 0) {
      setBlocksError('Añade al menos un ejercicio');
      return;
    }
    onSubmit({
      name: formValues.name,
      category: formValues.category!,
      level: formValues.level!,
      durationMin: formValues.durationMin!,
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
        <RoutineSummaryCard
          name={values.name ?? ''}
          category={values.category ?? null}
          level={values.level ?? null}
          durationMin={values.durationMin ?? null}
          exerciseCount={blocks.length}
          totalSets={totalSets}
        />

        <View className="gap-4 rounded-2xl border border-line bg-surface p-4">
          <Text className="text-xs font-bold uppercase tracking-wide text-ink-faint">
            Datos de la rutina
          </Text>

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
        </View>

        <View className="gap-3">
          <Text className="text-xs font-bold uppercase tracking-wide text-ink-faint">
            Ejercicios{blocks.length > 0 ? ` · ${blocks.length}` : ''}
          </Text>

          {blocks.map((block, index) => (
            <ExerciseBlockCard
              key={block.id}
              block={block}
              index={index}
              exercise={exerciseById.get(block.exerciseId)}
              expanded={expandedId === block.id}
              isFirst={index === 0}
              isLast={index === blocks.length - 1}
              onToggle={() =>
                setExpandedId((current) => (current === block.id ? null : block.id))
              }
              onChange={(next) => updateBlock(index, next)}
              onMoveUp={() => moveBlock(index, -1)}
              onMoveDown={() => moveBlock(index, 1)}
              onRemove={() => removeBlock(index)}
            />
          ))}

          <Pressable
            accessibilityRole="button"
            onPress={() => setPickerOpen(true)}
            className="flex-row items-center justify-center gap-1.5 rounded-2xl border border-dashed border-line py-4 active:bg-surface-subtle"
          >
            <Text className="text-sm font-semibold text-primary">＋ Añadir ejercicio</Text>
          </Pressable>

          {blocksError ? <Text className="text-sm text-red-500">{blocksError}</Text> : null}
        </View>
      </ScrollView>

      <View className="gap-3 border-t border-line px-5 py-3">
        {blocks.length > 0 ? (
          <Text className="text-center text-xs text-ink-faint">
            {blocks.length} {blocks.length === 1 ? 'ejercicio' : 'ejercicios'} · {totalSets}{' '}
            {totalSets === 1 ? 'serie' : 'series'} en total
          </Text>
        ) : null}
        <Button label={submitLabel} fullWidth loading={isSubmitting} onPress={submit} />
        {footer}
      </View>

      <ExercisePickerModal
        visible={pickerOpen}
        countByExerciseId={countByExerciseId}
        onClose={() => setPickerOpen(false)}
        onPick={addBlock}
      />
    </View>
  );
}
