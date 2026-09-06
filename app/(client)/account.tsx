import { Redirect, useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { DateStrip } from '@/components/DateStrip';
import { ListRow } from '@/components/ListRow';
import { useAuthStore } from '@/features/auth';
import {
  CLIENT_GOAL_LABEL,
  SUBSCRIPTION_STATUS_META,
  subscriptionStatus,
  useClient,
} from '@/features/clients';
import { confirm } from '@/lib/confirm';

function Stat({ value, label }: { value: string; label: string }): React.JSX.Element {
  return (
    <View className="flex-1 items-center gap-0.5">
      <Text className="text-base font-extrabold text-ink">{value}</Text>
      <Text className="text-xs text-ink-faint">{label}</Text>
    </View>
  );
}

export default function ClientAccountScreen(): React.JSX.Element {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const clientId = user?.clientId ?? '';
  const client = useClient(clientId, clientId !== '');

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  const detail = client.status === 'ready' ? client.data : null;
  const subStatus = subscriptionStatus(detail?.subscriptionUntil ?? null);

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
      <DateStrip />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-5 pb-8 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center gap-2 rounded-2xl bg-primary-light p-6">
          <Avatar uri={user.avatarUrl} size={92} ring />
          <Text className="text-xl font-extrabold text-ink">{user.name}</Text>
          <Badge label="Cliente" tone="primary" align="center" />
          <Text className="text-sm text-ink-muted">{user.email}</Text>
        </View>

        {detail ? (
          <>
            <View className="flex-row rounded-xl bg-surface-subtle px-2 py-4">
              <Stat value={CLIENT_GOAL_LABEL[detail.goal]} label="objetivo" />
              <View className="w-px self-stretch bg-line" />
              <Stat value={detail.memberSince} label="miembro desde" />
            </View>

            <View className="flex-row items-center justify-between rounded-xl bg-surface-subtle p-4">
              <View className="gap-0.5">
                <Text className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  Suscripción
                </Text>
                <Text className="text-sm font-semibold text-ink">
                  {detail.subscriptionUntil
                    ? `${subStatus === 'expired' ? 'Venció el' : 'Vigente hasta'} ${detail.subscriptionUntil}`
                    : 'Sin pagos registrados'}
                </Text>
              </View>
              <Badge
                label={SUBSCRIPTION_STATUS_META[subStatus].label}
                tone={SUBSCRIPTION_STATUS_META[subStatus].tone}
              />
            </View>
          </>
        ) : null}

        <View className="gap-3">
          <ListRow
            label="Política de Tratamiento de Datos"
            iconName="document-text-outline"
            onPress={() => router.push('/privacy')}
          />
          <ListRow
            label="Cerrar Sesión"
            iconName="log-out-outline"
            destructive
            onPress={confirmLogout}
          />
        </View>

        <View className="items-center gap-1 pt-2">
          <Text className="text-xs font-semibold uppercase tracking-widest text-ink-faint">
            NavyTeam
          </Text>
          <Text className="text-xs text-ink-faint">v1.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
