import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge } from '@/components/Badge';
import { FeedbackState } from '@/components/FeedbackState';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAssignPlanToClient } from '@/features/clients';
import { NUTRITION_CATEGORY_LABEL, useNutritionPlans } from '@/features/nutrition';

export default function AssignNutritionPlanScreen(): React.JSX.Element {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const plans = useNutritionPlans();
  const assignPlan = useAssignPlanToClient();

  const handleAssign = async (planId: string): Promise<void> => {
    if (plans.status !== 'ready') return;
    const plan = plans.data.find((p) => p.id === planId);
    if (!plan) return;
    await assignPlan.mutateAsync({ clientId: id, plan });
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <ScreenHeader title="Asignar Plan" centered onBack={() => router.back()} />

      {plans.status === 'loading' ? (
        <FeedbackState variant="loading" />
      ) : plans.status === 'error' ? (
        <FeedbackState variant="error" message={plans.error} />
      ) : plans.data.length === 0 ? (
        <FeedbackState variant="empty" message="No hay planes en el catálogo." />
      ) : (
        <View className="gap-2 px-5 pt-2">
          {plans.data.map((plan) => (
            <Pressable
              key={plan.id}
              accessibilityRole="button"
              disabled={assignPlan.isPending}
              onPress={() => handleAssign(plan.id)}
              className="flex-row items-center justify-between gap-2 rounded-2xl border border-line bg-surface p-3 active:bg-surface-subtle"
            >
              <View className="flex-1 gap-1">
                <Text className="text-sm font-bold text-ink">{plan.name}</Text>
                <Text className="text-xs text-ink-faint">{plan.kcalPerDay} kcal/día</Text>
              </View>
              <Badge label={NUTRITION_CATEGORY_LABEL[plan.category]} tone="primary" />
            </Pressable>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}
