import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FeedbackState } from '@/components/FeedbackState';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ExerciseProgressChart, useExerciseProgress } from '@/features/workouts';

export default function ExerciseProgressScreen(): React.JSX.Element {
  const router = useRouter();
  const { id, exerciseId, name } = useLocalSearchParams<{
    id: string;
    exerciseId: string;
    name?: string;
  }>();
  const progress = useExerciseProgress(id, exerciseId);

  const title =
    (progress.status === 'ready' && progress.data.exerciseName) || name || 'Progreso';

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <ScreenHeader title={title} centered onBack={() => router.back()} />

      {progress.status === 'loading' ? (
        <FeedbackState variant="loading" />
      ) : progress.status === 'error' ? (
        <FeedbackState variant="error" message={progress.error} />
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-5 px-5 pt-2 pb-6"
          showsVerticalScrollIndicator={false}
        >
          <ExerciseProgressChart progress={progress.data} />

          {progress.data.points.length > 0 ? (
            <View className="gap-3 rounded-2xl border border-line bg-surface-subtle p-4">
              <Text className="text-sm font-bold text-ink">Historial</Text>
              {[...progress.data.points].reverse().map((point, index) => (
                <View
                  key={`${point.date}-${index}`}
                  className="flex-row items-center justify-between"
                >
                  <Text className="text-sm text-ink">{point.date}</Text>
                  <Text className="text-xs text-ink-faint">
                    {point.topWeightKg} kg · {point.totalVolumeKg.toLocaleString('es-ES')} kg vol
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
