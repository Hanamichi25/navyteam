import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FeedbackState } from '@/components/FeedbackState';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SwipeToDismiss } from '@/components/SwipeToDismiss';
import { useAuthStore } from '@/features/auth';
import { COLORS } from '@/lib/colors';
import type { AppNotification } from '@/types/notification';

import {
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '../hooks/useNotifications';
import { routeForNotification } from '../labels';
import { NotificationRow } from './NotificationRow';

/** Bandeja de notificaciones — la misma pantalla para el entrenador y el cliente. */
export function NotificationsScreen(): React.JSX.Element {
  const router = useRouter();
  const queryClient = useQueryClient();
  const role = useAuthStore((state) => state.user?.role);
  const notifications = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const remove = useDeleteNotification();
  const [refreshing, setRefreshing] = useState(false);

  const items = notifications.status === 'ready' ? notifications.data : [];
  const hasUnread = items.some((n) => n.readAt === null);

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['notifications'] });
    setRefreshing(false);
  };

  const openItem = (item: AppNotification): void => {
    if (item.readAt === null) markRead.mutate(item.id);
    const target = routeForNotification(item.data, role);
    if (target) router.push(target as never);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <ScreenHeader
        title="Notificaciones"
        centered
        onBack={() => router.back()}
        action={
          hasUnread
            ? {
                iconName: 'checkmark-done-outline',
                accessibilityLabel: 'Marcar todo como leído',
                onPress: () => markAllRead.mutate(),
              }
            : undefined
        }
      />

      {notifications.status === 'loading' ? (
        <FeedbackState variant="loading" />
      ) : notifications.status === 'error' ? (
        <FeedbackState variant="error" message={notifications.error} />
      ) : items.length === 0 ? (
        <FeedbackState
          variant="empty"
          message="No tienes notificaciones. Aquí verás la actividad de tus clientes y los avisos de tu entrenador."
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-2.5 px-5 pb-8 pt-2"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
          renderItem={({ item }) => (
            <SwipeToDismiss
              label="Eliminar"
              iconName="trash-outline"
              onDismiss={() => remove.mutate(item.id)}
            >
              <NotificationRow item={item} onPress={() => openItem(item)} />
            </SwipeToDismiss>
          )}
        />
      )}
    </SafeAreaView>
  );
}
