import { Ionicons } from '@expo/vector-icons';
import { Redirect, useNavigation, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { ChipGroup } from '@/components/ChipGroup';
import { FeedbackState } from '@/components/FeedbackState';
import { useAuthStore } from '@/features/auth';
import {
  ACTIVITY_FILTERS,
  ActivityRow,
  NextSessionCard,
  PeriodToggle,
  QuickActions,
  SessionRow,
  StatCard,
  useDashboardData,
  type ActivityFilter,
  type QuickAction,
} from '@/features/dashboard';
import { todayShortLabel } from '@/lib/date';
import { openDrawer } from '@/lib/openDrawer';
import type { DashboardPeriod } from '@/types/dashboard';

export default function DashboardScreen(): React.JSX.Element {
  const navigation = useNavigation();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const dashboard = useDashboardData();

  const [period, setPeriod] = useState<DashboardPeriod>('month');
  const [openSessionId, setOpenSessionId] = useState<string | null>(null);
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('all');

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  const firstName = user.name.split(' ')[0] ?? user.name;
  const openMenu = (): void => openDrawer(navigation);

  const quickActions: readonly QuickAction[] = [
    {
      key: 'new-client',
      label: 'Nuevo cliente',
      icon: 'person-add-outline',
      onPress: () => router.push('/(app)/(tabs)/clients/new'),
    },
    {
      key: 'new-routine',
      label: 'Nueva rutina',
      icon: 'barbell-outline',
      onPress: () => router.push('/(app)/(tabs)/routines/new'),
    },
    {
      key: 'new-plan',
      label: 'Nuevo plan',
      icon: 'nutrition-outline',
      onPress: () => router.push('/(app)/(tabs)/nutrition/new'),
    },
  ];

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
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abrir menú"
          onPress={openMenu}
        >
          <Avatar uri={user.avatarUrl} size={40} />
        </Pressable>
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
              <PeriodToggle value={period} onChange={setPeriod} />
            </View>
            <View className="flex-row gap-2.5">
              {dashboard.data.stats[period].map((stat) => (
                <StatCard key={stat.id} stat={stat} />
              ))}
            </View>
          </View>

          <View className="px-5">
            <QuickActions actions={quickActions} />
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
                activity.map((item) => <ActivityRow key={item.id} item={item} />)
              )}
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
