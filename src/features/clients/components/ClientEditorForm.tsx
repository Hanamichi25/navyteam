import { zodResolver } from '@hookform/resolvers/zod';
import type { ReactNode } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, View } from 'react-native';

import { Button } from '@/components/Button';
import { DateField } from '@/components/DateField';
import { NumberField } from '@/components/NumberField';
import { SelectField } from '@/components/SelectField';
import { TextField } from '@/components/TextField';
import type { ClientDetail, ClientInput } from '@/types/client';
import { CLIENT_GOAL_OPTIONS } from '../labels';
import { clientSchema, type ClientFormValues } from '../validation';

interface ClientEditorFormProps {
  /** Presente = editar (oculta "Peso inicial"); ausente = crear. */
  initialValues?: ClientDetail;
  submitLabel: string;
  isSubmitting: boolean;
  /** `startWeightKg` viene informado solo al crear; el caller decide qué hacer con él. */
  onSubmit: (input: ClientInput, startWeightKg: number | null) => void | Promise<void>;
  /** Contenido extra bajo el botón principal, ej: eliminar en modo edición. */
  footer?: ReactNode;
}

/** Formulario compartido de cliente, usado en modo crear y editar. */
export function ClientEditorForm({
  initialValues,
  submitLabel,
  isSubmitting,
  onSubmit,
  footer,
}: ClientEditorFormProps): React.JSX.Element {
  const isCreate = !initialValues;

  const { control, handleSubmit } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema(isCreate)),
    defaultValues: {
      name: initialValues?.name ?? '',
      goal: initialValues?.goal ?? null,
      email: initialValues?.email ?? '',
      phone: initialValues?.phone ?? '',
      birthDate: initialValues?.birthDate ?? '',
      heightCm: initialValues?.heightCm ?? null,
      goalKg: initialValues?.weightProgress.goalKg ?? null,
      monthlyFeeEur: initialValues?.monthlyFeeEur ?? null,
      startWeightKg: null,
      notes: initialValues?.notes ?? '',
    },
    mode: 'onTouched',
  });

  const submit = handleSubmit((values) => {
    onSubmit(
      {
        name: values.name,
        goal: values.goal!,
        email: values.email.trim() || undefined,
        phone: values.phone.trim() || undefined,
        birthDate: values.birthDate,
        heightCm: values.heightCm!,
        goalKg: values.goalKg!,
        monthlyFeeEur: values.monthlyFeeEur!,
        notes: values.notes.trim() || undefined,
      },
      isCreate ? values.startWeightKg : null,
    );
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
              placeholder="María López"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="goal"
          render={({ field: { value, onChange }, fieldState }) => (
            <SelectField
              label="Objetivo"
              options={CLIENT_GOAL_OPTIONS}
              value={value}
              onChange={onChange}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="birthDate"
          render={({ field: { value, onChange, onBlur }, fieldState }) => (
            <DateField
              label="Fecha de nacimiento"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
            />
          )}
        />

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Controller
              control={control}
              name="heightCm"
              render={({ field: { value, onChange, onBlur }, fieldState }) => (
                <NumberField
                  label="Altura"
                  placeholder="170"
                  suffix="cm"
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  error={fieldState.error?.message}
                />
              )}
            />
          </View>
          <View className="flex-1">
            <Controller
              control={control}
              name="goalKg"
              render={({ field: { value, onChange, onBlur }, fieldState }) => (
                <NumberField
                  label="Meta de peso"
                  placeholder="65"
                  suffix="kg"
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  error={fieldState.error?.message}
                />
              )}
            />
          </View>
        </View>

        {isCreate ? (
          <Controller
            control={control}
            name="startWeightKg"
            render={({ field: { value, onChange, onBlur }, fieldState }) => (
              <NumberField
                label="Peso inicial"
                placeholder="70"
                suffix="kg"
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                error={fieldState.error?.message}
              />
            )}
          />
        ) : null}

        <Controller
          control={control}
          name="monthlyFeeEur"
          render={({ field: { value, onChange, onBlur }, fieldState }) => (
            <NumberField
              label="Cuota mensual"
              placeholder="40"
              suffix="€/mes"
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange, onBlur }, fieldState }) => (
            <TextField
              label="Email (opcional)"
              placeholder="maria@correo.com"
              keyboardType="email-address"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="phone"
          render={({ field: { value, onChange, onBlur }, fieldState }) => (
            <TextField
              label="Teléfono (opcional)"
              placeholder="+34 600 000 000"
              keyboardType="phone-pad"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="notes"
          render={({ field: { value, onChange, onBlur }, fieldState }) => (
            <TextField
              label="Notas (opcional)"
              placeholder="Lesiones previas, preferencias, disponibilidad..."
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
