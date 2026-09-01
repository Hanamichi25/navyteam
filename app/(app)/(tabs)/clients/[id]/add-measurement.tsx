import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import { Button } from '@/components/Button';
import { DateField } from '@/components/DateField';
import { NumberField } from '@/components/NumberField';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAddMeasurement } from '@/features/clients';
import { todayDdMmAaaa } from '@/lib/date';

const measurementSchema = z
  .object({
    date: z.string(),
    weightKg: z.number().nullable(),
    waistCm: z.number().nullable(),
    chestCm: z.number().nullable(),
    hipCm: z.number().nullable(),
    armCm: z.number().nullable(),
  })
  .superRefine((values, ctx) => {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(values.date)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['date'], message: 'Usa el formato dd/mm/aaaa' });
    }
    if (values.weightKg === null || values.weightKg <= 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['weightKg'], message: 'Ingresa el peso' });
    }
  });

type MeasurementFormValues = z.infer<typeof measurementSchema>;

export default function AddMeasurementScreen(): React.JSX.Element {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const addMeasurement = useAddMeasurement();

  const { control, handleSubmit } = useForm<MeasurementFormValues>({
    resolver: zodResolver(measurementSchema),
    defaultValues: {
      date: todayDdMmAaaa(),
      weightKg: null,
      waistCm: null,
      chestCm: null,
      hipCm: null,
      armCm: null,
    },
    mode: 'onTouched',
  });

  const submit = handleSubmit(async (values) => {
    await addMeasurement.mutateAsync({
      clientId: id,
      input: {
        date: values.date,
        weightKg: values.weightKg!,
        waistCm: values.waistCm ?? undefined,
        chestCm: values.chestCm ?? undefined,
        hipCm: values.hipCm ?? undefined,
        armCm: values.armCm ?? undefined,
      },
    });
    router.back();
  });

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <ScreenHeader title="Agregar Medición" centered onBack={() => router.back()} />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-5 pt-2 pb-6"
        showsVerticalScrollIndicator={false}
      >
        <Controller
          control={control}
          name="date"
          render={({ field: { value, onChange, onBlur }, fieldState }) => (
            <DateField
              label="Fecha"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="weightKg"
          render={({ field: { value, onChange, onBlur }, fieldState }) => (
            <NumberField
              label="Peso"
              placeholder="70"
              suffix="kg"
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
            />
          )}
        />

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Controller
              control={control}
              name="waistCm"
              render={({ field: { value, onChange, onBlur } }) => (
                <NumberField
                  label="Cintura (opcional)"
                  suffix="cm"
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                />
              )}
            />
          </View>
          <View className="flex-1">
            <Controller
              control={control}
              name="chestCm"
              render={({ field: { value, onChange, onBlur } }) => (
                <NumberField
                  label="Pecho (opcional)"
                  suffix="cm"
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                />
              )}
            />
          </View>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Controller
              control={control}
              name="hipCm"
              render={({ field: { value, onChange, onBlur } }) => (
                <NumberField
                  label="Cadera (opcional)"
                  suffix="cm"
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                />
              )}
            />
          </View>
          <View className="flex-1">
            <Controller
              control={control}
              name="armCm"
              render={({ field: { value, onChange, onBlur } }) => (
                <NumberField
                  label="Brazo (opcional)"
                  suffix="cm"
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                />
              )}
            />
          </View>
        </View>
      </ScrollView>

      <View className="gap-3 border-t border-line px-5 py-3">
        <Button label="Guardar medición" fullWidth loading={addMeasurement.isPending} onPress={submit} />
      </View>
    </SafeAreaView>
  );
}
