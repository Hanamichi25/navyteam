import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import { Button } from '@/components/Button';
import { DateField } from '@/components/DateField';
import { FeedbackState } from '@/components/FeedbackState';
import { NumberField } from '@/components/NumberField';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useClient, useRegisterPayment } from '@/features/clients';
import { addMonths, formatDdMmAaaa, parseDdMmAaaa, todayDdMmAaaa } from '@/lib/date';

const MONTH_OPTIONS = [1, 3, 6, 12] as const;

const paymentSchema = z
  .object({
    date: z.string(),
    amountEur: z.number().nullable(),
  })
  .superRefine((values, ctx) => {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(values.date)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['date'], message: 'Usa el formato dd/mm/aaaa' });
    }
    if (values.amountEur === null || values.amountEur <= 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['amountEur'], message: 'Ingresa el importe' });
    }
  });

type PaymentFormValues = z.infer<typeof paymentSchema>;

/** Extiende la vigencia `months` meses desde hoy o desde la vigencia vigente. */
function previewCoversUntil(currentUntil: string | null, months: number): string {
  const now = new Date();
  const parsed = currentUntil ? parseDdMmAaaa(currentUntil) : null;
  const base = parsed && parsed.getTime() > now.getTime() ? parsed : now;
  return formatDdMmAaaa(addMonths(base, months));
}

export default function RegisterPaymentScreen(): React.JSX.Element {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const client = useClient(id);
  const registerPayment = useRegisterPayment();
  const [months, setMonths] = useState<number>(1);

  const { control, handleSubmit, setValue } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { date: todayDdMmAaaa(), amountEur: null },
    mode: 'onTouched',
  });

  // Cuando llega el detalle, prellena el importe con la cuota del cliente (una vez).
  const monthlyFee =
    client.status === 'ready' ? client.data.monthlyFeeEur : null;
  const feeApplied = useRef(false);
  useEffect(() => {
    if (!feeApplied.current && monthlyFee !== null && monthlyFee > 0) {
      feeApplied.current = true;
      setValue('amountEur', monthlyFee);
    }
  }, [monthlyFee, setValue]);

  const currentUntil =
    client.status === 'ready' ? client.data.subscriptionUntil : null;
  const coversUntil = previewCoversUntil(currentUntil, months);

  const submit = handleSubmit(async (values) => {
    await registerPayment.mutateAsync({
      clientId: id,
      input: { date: values.date, amountEur: values.amountEur!, months },
    });
    router.back();
  });

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <ScreenHeader title="Registrar Pago" centered onBack={() => router.back()} />

      {client.status === 'loading' ? (
        <FeedbackState variant="loading" />
      ) : client.status === 'error' ? (
        <FeedbackState variant="error" message={client.error} />
      ) : (
        <>
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
                  label="Fecha del pago"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={fieldState.error?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="amountEur"
              render={({ field: { value, onChange, onBlur }, fieldState }) => (
                <NumberField
                  label="Importe"
                  placeholder="40"
                  suffix="€"
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  error={fieldState.error?.message}
                />
              )}
            />

            <View className="gap-2">
              <Text className="text-sm font-semibold text-ink">Meses que cubre</Text>
              <View className="flex-row gap-2">
                {MONTH_OPTIONS.map((option) => {
                  const active = option === months;
                  return (
                    <Pressable
                      key={option}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      onPress={() => setMonths(option)}
                      className={`flex-1 items-center rounded-xl border py-2.5 ${
                        active
                          ? 'border-primary bg-primary-light'
                          : 'border-line bg-surface'
                      }`}
                    >
                      <Text
                        className={`text-sm font-bold ${
                          active ? 'text-primary' : 'text-ink-muted'
                        }`}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View className="gap-1 rounded-2xl border border-line bg-surface-subtle p-4">
              <Text className="text-xs font-bold uppercase tracking-wide text-ink-faint">
                Nueva vigencia
              </Text>
              <Text className="text-lg font-extrabold text-ink">{coversUntil}</Text>
              <Text className="text-xs text-ink-muted">
                {currentUntil
                  ? `Ahora vence el ${currentUntil}.`
                  : 'Es el primer pago registrado.'}
              </Text>
            </View>
          </ScrollView>

          <View className="border-t border-line px-5 py-3">
            <Button
              label="Registrar pago"
              fullWidth
              loading={registerPayment.isPending}
              onPress={submit}
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
