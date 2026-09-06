import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { Redirect, useNavigation, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { ChipGroup } from '@/components/ChipGroup';
import { FeedbackState } from '@/components/FeedbackState';
import { PeriodToggle } from '@/components/PeriodToggle';
import { SwipeToDismiss } from '@/components/SwipeToDismiss';
import { useAuthStore } from '@/features/auth';
import { NotificationBell } from '@/features/notifications';
import { COLORS } from '@/lib/colors';
import {
  AchievementRow,
  ACTIVITY_FILTERS,
  ActivityRow,
  NextSessionCard,
  SessionRow,
  StatCard,
  useDashboardData,
  useDismissDashboardItem,
  useRestoreDashboardItems,
  type ActivityFilter,
} from '@/features/dashboard';
import { todayShortLabel } from '@/lib/date';
import { openDrawer } from '@/lib/openDrawer';
import type { ActivityItem, DashboardPeriod } from '@/types/dashboard';

const PERIOD_OPTIONS: readonly { value: DashboardPeriod; label: string }[] = [
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mes' },
];

export default function DashboardScreen(): React.JSX.Element {
  const navigation = useNavigation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const dashboard = useDashboardData();
  const dismissItem = useDismissDashboardItem();
  const restoreItems = useRestoreDashboardItems();

  const [period, setPeriod] = useState<DashboardPeriod>('month');
  const [openSessionId, setOpenSessionId] = useState<string | null>(null);
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('all');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    setRefreshing(false);
  };

  const openActivity = (item: ActivityItem): void => {
    if (!item.clientId) return;
    if (item.kind === 'workout' && item.entityId) {
      router.push(`/(app)/(tabs)/clients/${item.clientId}/session/${item.entityId}`);
    } else if (item.kind === 'message') {
      router.push(`/(app)/(tabs)/clients/${item.clientId}/messages`);
    } else {
      router.push(`/(app)/(tabs)/clients/${item.clientId}`);
    }
  };

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  const firstName = user.name.split(' ')[0] ?? user.name;
  const openMenu = (): void => openDrawer(navigation);

  const openAchievement = (
    clientId: string,
    exerciseId: string | undefined,
  ): void => {
    router.push(
      exerciseId
        ? `/(app)/(tabs)/clients/${clientId}/progress/${exerciseId}`
        : `/(app)/(tabs)/clients/${clientId}`,
    );
  };

  const data = dashboard.status === 'ready' ? dashboard.data : null;
  const nextSession = data?.upcomingSessions[0] ?? null;
  const activity = !data
    ? []
    : activityFilter === 'all'
      ? data.recentActivity
      : data.recentActivity.filter((item) => item.kind === activityFilter);

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <View className="flex-row items-center justify-between px-5 py-3">
        <View className="flex-1 flex-row items-center gap-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Abrir menú"
            onPress={openMenu}
            className="h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface active:bg-surface-subtle"
          >
            <Ionicons name="menu" size={22} color="#0F172A" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-xl font-extrabold text-ink">Hola, {firstName}</Text>
            <Text className="text-xs text-ink-faint">
              {todayShortLabel()}
              {data ? ` · ${data.activeUsers} usuarios activos` : ''}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center gap-2.5">
          <NotificationBell onPress={() => router.push('/(app)/notifications')} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Abrir menú"
            onPress={openMenu}
          >
            <Avatar uri={user.avatarUrl} size={40} />
          </Pressable>
        </View>
      </View>

      {dashboard.status === 'loading' ? (
        <FeedbackState variant="loading" />
      ) : dashboard.status === 'error' ? (
        <FeedbackState variant="error" message={dashboard.error} />
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="pb-8 pt-1 gap-6"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
        >
          {nextSession ? (
            <View className="px-5">
              <NextSessionCard
                session={nextSession}
                onPress={() =>
                  router.push(`/(app)/(tabs)/clients/${nextSession.clientId}`)
                }
              />
            </View>
          ) : null}

          <View className="gap-3 px-5">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-bold text-ink">Resumen</Text>
              <PeriodToggle
                options={PERIOD_OPTIONS}
                value={period}
                onChange={setPeriod}
              />
            </View>
            <View className="flex-row gap-2.5">
              {dashboard.data.stats[period].map((stat) => (
                <StatCard key={stat.id} stat={stat} />
              ))}
            </View>
          </View>

          <View className="gap-3 px-5">
            <Text className="text-lg font-bold text-ink">Logros de la semana</Text>
            {dashboard.data.weeklyAchievements.length === 0 ? (
              <Text className="text-sm text-ink-muted">
                Aún no hay logros esta semana. Aparecerán aquí cuando tus clientes
                batan un récord o mantengan su racha.
              </Text>
            ) : (
              dashboard.data.weeklyAchievements.map((achievement) => (
                <SwipeToDismiss
                  key={achievement.id}
                  onDismiss={() => dismissItem.mutate(achievement.id)}
                >
                  <AchievementRow
                    item={achievement}
                    onPress={() =>
                      openAchievement(achievement.clientId, achievement.exerciseId)
                    }
                  />
                </SwipeToDismiss>
              ))
            )}
          </View>

          <View className="gap-3 px-5">
            <Text className="text-lg font-bold text-ink">Hoy</Text>
            {dashboard.data.upcomingSessions.length === 0 ? (
              <Text className="text-sm text-ink-muted">
                No hay sesiones para hoy.
              </Text>
            ) : (
              dashboard.data.upcomingSessions.map((session) => (
                <SessionRow
                  key={session.id}
                  session={session}
                  expanded={openSessionId === session.id}
                  onToggle={() =>
                    setOpenSessionId((current) =>
                      current === session.id ? null : session.id,
                    )
                  }
                  onLogSession={() =>
                    router.push(
                      `/(app)/(tabs)/clients/${session.clientId}/log-session`,
                    )
                  }
                  onViewProfile={() =>
                    router.push(`/(app)/(tabs)/clients/${session.clientId}`)
                  }
                />
              ))
            )}
          </View>

          <View className="gap-3">
            <Text className="px-5 text-lg font-bold text-ink">
              Actividad reciente
            </Text>
            <ChipGroup
              options={ACTIVITY_FILTERS}
              value={activityFilter}
              onChange={setActivityFilter}
            />
            <View className="gap-3 px-5">
              {activity.length === 0 ? (
                <Text className="text-sm text-ink-muted">
                  Sin actividad de este tipo.
                </Text>
              ) : (
                activity.map((item) => (
                  <SwipeToDismiss key={item.id} onDismiss={() => dismissItem.mutate(item.id)}>
                    <ActivityRow item={item} onPress={() => openActivity(item)} />
                  </SwipeToDismiss>
                ))
              )}

              {data && data.dismissedCount > 0 ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => restoreItems.mutate()}
                  className="self-start pt-1"
                >
                  <Text className="text-xs font-semibold text-primary">
                    Mostrar ocultos ({data.dismissedCount})
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
