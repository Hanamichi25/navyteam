import { Redirect } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FeedbackState } from '@/components/FeedbackState';
import { useAuthStore } from '@/features/auth';
import { useClient } from '@/features/clients';
import { AssignedRoutineView } from '@/features/routines';

export default function ClientRoutineScreen(): React.JSX.Element {
  const user = useAuthStore((state) => state.user);
  const clientId = user?.clientId ?? '';
  const client = useClient(clientId, clientId !== '');

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <View className="px-5 pb-2 pt-3">
        <Text className="text-2xl font-extrabold text-ink">Mi rutina</Text>
      </View>

      {!clientId ? (
        <FeedbackState
          variant="error"
          message="Tu cuenta no está vinculada a un perfil de cliente."
        />
      ) : client.status === 'loading' ? (
        <FeedbackState variant="loading" />
      ) : client.status === 'error' ? (
        <FeedbackState variant="error" message={client.error} />
      ) : client.data.assignedRoutines.length === 0 ? (
        <FeedbackState
          variant="empty"
          iconName="barbell-outline"
          message="Tu entrenador todavía no te ha asignado ninguna rutina."
        />
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-6 px-5 pb-8 pt-1"
          showsVerticalScrollIndicator={false}
        >
          {client.data.assignedRoutines.map((routine) => (
            <AssignedRoutineView
              key={routine.id}
              routineId={routine.id}
              schedule={routine.schedule}
              fallbackName={routine.name}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
