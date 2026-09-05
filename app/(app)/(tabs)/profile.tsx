import { Redirect, useRouter } from 'expo-router';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { ListRow } from '@/components/ListRow';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAuthStore } from '@/features/auth';

/**
 * Perfil del entrenador. Provisional: no hay mockup dedicado todavía.
 * Reúne la identidad del usuario y accesos a Configuración / Soporte / Logout.
 */
export default function ProfileScreen(): React.JSX.Element {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

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
      <ScreenHeader title="Perfil" />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-8 gap-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center gap-2 rounded-2xl bg-primary-light p-6">
          <Avatar uri={user.avatarUrl} size={92} ring />
          <Text className="text-xl font-extrabold text-ink">{user.name}</Text>
          <Text className="text-xs font-semibold uppercase tracking-wide text-primary">
            Entrenador Personal
          </Text>
          <Text className="text-sm text-ink-muted">{user.email}</Text>
        </View>

        <View className="gap-3">
          <ListRow
            label="Configuración"
            iconName="settings-outline"
            onPress={() => router.push('/(app)/settings')}
          />
          <ListRow
            label="Ayuda y Soporte"
            iconName="help-circle-outline"
            onPress={() => router.push('/(app)/support')}
          />
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
