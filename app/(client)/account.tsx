import { Redirect, useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { ListRow } from '@/components/ListRow';
import { useAuthStore } from '@/features/auth';
import { confirm } from '@/lib/confirm';

export default function ClientAccountScreen(): React.JSX.Element {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  const confirmLogout = (): void => {
    confirm(
      {
        title: 'Cerrar sesión',
        message: '¿Seguro que quieres salir de tu cuenta?',
        confirmLabel: 'Cerrar sesión',
        destructive: true,
      },
      async () => {
        await logout();
        router.replace('/(auth)/login');
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <View className="px-5 pb-2 pt-3">
        <Text className="text-2xl font-extrabold text-ink">Cuenta</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-8 gap-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center gap-2 pt-2">
          <Avatar uri={user.avatarUrl} size={88} />
          <Text className="text-xl font-extrabold text-ink">{user.name}</Text>
          <Text className="text-xs font-semibold uppercase tracking-wide text-primary">
            Cliente
          </Text>
          <Text className="text-sm text-ink-muted">{user.email}</Text>
        </View>

        <View className="gap-3">
          <ListRow
            label="Cerrar Sesión"
            iconName="log-out-outline"
            destructive
            onPress={confirmLogout}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
