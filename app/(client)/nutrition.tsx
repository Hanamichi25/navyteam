import { Redirect } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FeedbackState } from '@/components/FeedbackState';
import { useAuthStore } from '@/features/auth';
import { useClient } from '@/features/clients';
import { NutritionPlanDetail, useNutritionPlans } from '@/features/nutrition';

export default function ClientNutritionScreen(): React.JSX.Element {
  const user = useAuthStore((state) => state.user);
  const clientId = user?.clientId ?? '';
  const client = useClient(clientId, clientId !== '');
  const plans = useNutritionPlans();

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  const assignedPlan =
    client.status === 'ready' ? client.data.assignedPlan : null;
  const fullPlan =
    assignedPlan && plans.status === 'ready'
      ? plans.data.find((plan) => plan.id === assignedPlan.id)
      : null;

  const loading = client.status === 'loading' || plans.status === 'loading';
  const errored = client.status === 'error' || plans.status === 'error';

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <View className="px-5 pb-2 pt-3">
        <Text className="text-2xl font-extrabold text-ink">Mi alimentación</Text>
      </View>

      {!clientId ? (
        <FeedbackState
          variant="error"
          message="Tu cuenta no está vinculada a un perfil de cliente."
        />
      ) : loading ? (
        <FeedbackState variant="loading" />
      ) : errored ? (
        <FeedbackState
          variant="error"
          message="No se pudo cargar tu plan de alimentación."
        />
      ) : !assignedPlan ? (
        <FeedbackState
          variant="empty"
          iconName="nutrition-outline"
          message="Tu entrenador todavía no te ha asignado un plan de alimentación."
        />
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-4 px-5 pb-8 pt-1"
          showsVerticalScrollIndicator={false}
        >
          {fullPlan ? (
            <NutritionPlanDetail plan={fullPlan} />
          ) : (
            <View className="gap-1.5">
              <Text className="text-lg font-bold text-ink">{assignedPlan.name}</Text>
              <Text className="text-base font-semibold text-primary">
                {assignedPlan.kcalPerDay} kcal/día
              </Text>
              <Text className="text-sm text-ink-muted">
                No se pudo cargar el detalle del plan.
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
