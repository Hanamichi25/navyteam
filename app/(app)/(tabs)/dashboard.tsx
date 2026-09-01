import { Ionicons } from '@expo/vector-icons';
import { Redirect, useNavigation } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { FeedbackState } from '@/components/FeedbackState';
import { useAuthStore } from '@/features/auth';
import { openDrawer } from '@/lib/openDrawer';
import {
  ActivityRow,
  SessionRow,
  StatCard,
  useDashboardData,
} from '@/features/dashboard';

export default function DashboardScreen(): React.JSX.Element {
  const navigation = useNavigation();
  const user = useAuthStore((state) => state.user);
  const dashboard = useDashboardData();

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  const firstName = user.name.split(' ')[0] ?? user.name;
  const openMenu = (): void => openDrawer(navigation);

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <View className="flex-row items-center justify-between px-5 py-3">
        <View className="flex-row items-center gap-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Abrir menú"
            onPress={openMenu}
            className="h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface active:bg-surface-subtle"
          >
            <Ionicons name="menu" size={22} color="#0F172A" />
          </Pressable>
          <Text className="text-xl font-extrabold text-ink">Hola, {firstName}</Text>
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
          contentContainerClassName="px-5 pb-8 pt-1 gap-6"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row gap-3">
            {dashboard.data.stats.map((stat) => (
              <StatCard key={stat.id} stat={stat} />
            ))}
          </View>

          <View className="gap-3">
            <Text className="text-lg font-bold text-ink">Actividad Reciente</Text>
            {dashboard.data.recentActivity.map((item) => (
              <ActivityRow key={item.id} item={item} />
            ))}
          </View>

          <View className="gap-3">
            <Text className="text-lg font-bold text-ink">Próximas Sesiones</Text>
            {dashboard.data.upcomingSessions.map((session) => (
              <SessionRow key={session.id} session={session} />
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
