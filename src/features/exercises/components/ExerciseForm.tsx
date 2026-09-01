import { zodResolver } from '@hookform/resolvers/zod';
import type { ReactNode } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, View } from 'react-native';

import { Button } from '@/components/Button';
import { SelectField } from '@/components/SelectField';
import { TextField } from '@/components/TextField';
import type { ExerciseInput } from '@/types/exercise';
import { MUSCLE_GROUP_OPTIONS } from '../labels';
import { exerciseSchema, type ExerciseFormValues } from '../validation';

interface ExerciseFormProps {
  initialValues?: ExerciseInput;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (input: ExerciseInput) => void | Promise<void>;
  /** Contenido extra bajo el botón principal, ej: eliminar en modo edición. */
  footer?: ReactNode;
}

/** Formulario compartido de ejercicio, usado en modo crear y editar. */
export function ExerciseForm({
  initialValues,
  submitLabel,
  isSubmitting,
  onSubmit,
  footer,
}: ExerciseFormProps): React.JSX.Element {
  const { control, handleSubmit } = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      name: initialValues?.name ?? '',
      muscleGroup: initialValues?.muscleGroup ?? null,
      equipment: initialValues?.equipment ?? '',
      description: initialValues?.description ?? '',
    },
    mode: 'onTouched',
  });

  const submit = handleSubmit((values) => {
    onSubmit({
      name: values.name,
      muscleGroup: values.muscleGroup!,
      equipment: values.equipment,
      description: values.description.trim() || undefined,
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
              placeholder="Press de banca"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="muscleGroup"
          render={({ field: { value, onChange }, fieldState }) => (
            <SelectField
              label="Grupo muscular"
              options={MUSCLE_GROUP_OPTIONS}
              value={value}
              onChange={onChange}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="equipment"
          render={({ field: { value, onChange, onBlur }, fieldState }) => (
            <TextField
              label="Equipo"
              placeholder="Barra, mancuernas, peso corporal..."
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field: { value, onChange, onBlur }, fieldState }) => (
            <TextField
              label="Descripción (opcional)"
              placeholder="Cómo se ejecuta el ejercicio..."
              multiline
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
            />
          )}
        />
      </ScrollView>

      <View className="gap-3 border-t border-line px-5 py-3">
        <Button label={submitLabel} fullWidth loading={isSubmitting} onPress={submit} />
        {footer}
      </View>
    </View>
  );
}
