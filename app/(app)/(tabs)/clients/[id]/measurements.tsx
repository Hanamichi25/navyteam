import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FeedbackState } from '@/components/FeedbackState';
import { ScreenHeader } from '@/components/ScreenHeader';
import { MeasurementHistoryList, useClient } from '@/features/clients';

/** Historial completo de mediciones de un cliente, con acceso a agregar una nueva. */
export default function ClientMeasurementsScreen(): React.JSX.Element {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const client = useClient(id);

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <ScreenHeader title="Historial de mediciones" centered onBack={() => router.back()} />

      {client.status === 'loading' ? (
        <FeedbackState variant="loading" />
      ) : client.status === 'error' ? (
        <FeedbackState variant="error" message={client.error} />
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-3 px-5 pb-6 pt-2"
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push(`/(app)/(tabs)/clients/${id}/add-measurement`)}
            className="flex-row items-center justify-center gap-1.5 rounded-xl border border-dashed border-line py-3 active:bg-surface-subtle"
          >
            <Text className="text-sm font-semibold text-primary">+ Agregar medición</Text>
          </Pressable>

          {client.data.measurements.length === 0 ? (
            <Text className="px-1 text-sm text-ink-muted">
              Todavía no hay mediciones registradas.
            </Text>
          ) : (
            <MeasurementHistoryList measurements={client.data.measurements} />
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
