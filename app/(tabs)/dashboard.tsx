import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/features/auth/store/authStore';
import { ActivityRow } from '@/features/dashboard/components/ActivityRow';
import { BottomNav } from '@/features/dashboard/components/BottomNav';
import { SessionRow } from '@/features/dashboard/components/SessionRow';
import { StatCard } from '@/features/dashboard/components/StatCard';
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData';

export default function DashboardScreen(): React.JSX.Element {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const dashboard = useDashboardData();

  // Salvaguarda: el layout ya redirige, pero evitamos renderizar sin usuario.
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  const firstName = user.name.split(' ')[0] ?? user.name;

  const confirmLogout = (): void => {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir de tu cuenta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <View className="flex-row items-center justify-between px-5 py-3">
        <View className="flex-row items-center gap-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cerrar sesión"
            onPress={confirmLogout}
            className="h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface active:bg-surface-subtle"
          >
            <Ionicons name="menu" size={22} color="#0F172A" />
          </Pressable>
          <Text className="text-xl font-extrabold text-ink">Hola, {firstName}</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={confirmLogout}>
          <Image
            source={{ uri: user.avatarUrl }}
            className="h-10 w-10 rounded-full"
          />
        </Pressable>
      </View>

      {dashboard.status === 'loading' ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#2563EB" />
        </View>
      ) : dashboard.status === 'error' ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-base text-ink-muted">
            {dashboard.error}
          </Text>
        </View>
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

          <Pressable
            accessibilityRole="button"
            onPress={confirmLogout}
            className="mt-2 h-12 flex-row items-center justify-center gap-2 rounded-2xl border border-line bg-surface active:bg-surface-subtle"
          >
            <Ionicons name="log-out-outline" size={18} color="#64748B" />
            <Text className="text-sm font-semibold text-ink-muted">
              Cerrar sesión
            </Text>
          </Pressable>
        </ScrollView>
      )}

      <BottomNav />
    </SafeAreaView>
  );
}
