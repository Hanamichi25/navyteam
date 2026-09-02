import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FeedbackState } from '@/components/FeedbackState';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SessionDetailView, useWorkoutSession } from '@/features/workouts';

export default function ClientWorkoutSessionScreen(): React.JSX.Element {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const session = useWorkoutSession(sessionId);

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <ScreenHeader title="Sesión" centered onBack={() => router.back()} />

      {session.status === 'loading' ? (
        <FeedbackState variant="loading" />
      ) : session.status === 'error' ? (
        <FeedbackState variant="error" message={session.error} />
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-5 px-5 pt-2 pb-6"
          showsVerticalScrollIndicator={false}
        >
          <SessionDetailView session={session.data} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
