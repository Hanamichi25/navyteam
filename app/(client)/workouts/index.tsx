import { Redirect, useRouter } from 'expo-router';
import { FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { FeedbackState } from '@/components/FeedbackState';
import { useAuthStore } from '@/features/auth';
import { SessionSummaryRow, useClientWorkouts } from '@/features/workouts';

export default function ClientWorkoutsScreen(): React.JSX.Element {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clientId = user?.clientId ?? '';
  const workouts = useClientWorkouts(clientId);

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <View className="px-5 pb-2 pt-3">
        <Text className="text-2xl font-extrabold text-ink">Mis entrenos</Text>
      </View>

      {!clientId ? (
        <FeedbackState
          variant="error"
          message="Tu cuenta no está vinculada a un perfil de cliente."
        />
      ) : workouts.status === 'loading' ? (
        <FeedbackState variant="loading" />
      ) : workouts.status === 'error' ? (
        <FeedbackState variant="error" message={workouts.error} />
      ) : workouts.data.length === 0 ? (
        <View className="flex-1">
          <FeedbackState
            variant="empty"
            iconName="barbell-outline"
            message="Todavía no has registrado ningún entreno. Pulsa el botón para registrar el primero."
          />
        </View>
      ) : (
        <FlatList
          data={workouts.data}
          keyExtractor={(session) => session.id}
          contentContainerClassName="gap-3 px-5 pb-4 pt-1"
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <SessionSummaryRow
              summary={item}
              onPress={() => router.push(`/(client)/workouts/${item.id}`)}
            />
          )}
        />
      )}

      {clientId ? (
        <View className="border-t border-line px-5 py-3">
          <Button
            label="Registrar sesión"
            fullWidth
            onPress={() => router.push('/(client)/workouts/log')}
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
}
