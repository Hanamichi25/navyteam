import { Ionicons } from '@expo/vector-icons';
import {
  DrawerContentScrollView,
  type DrawerContentComponentProps,
} from 'expo-router/drawer';
import { useRouter, usePathname } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { useAuthStore } from '@/features/auth';
import { confirm } from '@/lib/confirm';
import { Avatar } from './Avatar';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface DrawerLink {
  label: string;
  icon: IoniconName;
  /** Ruta destino. */
  href: string;
  /** Prefijos de pathname que marcan este item como activo. */
  match: string[];
  badge?: number;
}

const PRIMARY_LINKS: readonly DrawerLink[] = [
  { label: 'Inicio', icon: 'home-outline', href: '/(app)/(tabs)/dashboard', match: ['/dashboard'] },
  { label: 'Mis Usuarios', icon: 'people-outline', href: '/(app)/(tabs)/clients', match: ['/clients'] },
  { label: 'Rutinas', icon: 'barbell-outline', href: '/(app)/(tabs)/routines', match: ['/routines'] },
  { label: 'Ejercicios', icon: 'fitness-outline', href: '/(app)/exercises', match: ['/exercises'] },
  { label: 'Alimentación', icon: 'nutrition-outline', href: '/(app)/(tabs)/nutrition', match: ['/nutrition'] },
  { label: 'Mensajes', icon: 'chatbubble-outline', href: '/(app)/messages', match: ['/messages'], badge: 2 },
  { label: 'Estadísticas', icon: 'stats-chart-outline', href: '/(app)/stats', match: ['/stats'] },
  { label: 'Configuración', icon: 'settings-outline', href: '/(app)/settings', match: ['/settings'] },
];

function isActive(pathname: string, match: string[]): boolean {
  return match.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function DrawerItem({
  link,
  active,
  onPress,
}: {
  link: DrawerLink;
  active: boolean;
  onPress: () => void;
}): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      className={`flex-row items-center gap-4 rounded-xl px-4 py-2.5 ${active ? 'bg-primary-light' : 'active:bg-surface-subtle'}`}
    >
      <Ionicons name={link.icon} size={22} color={active ? '#2563EB' : '#334155'} />
      <Text
        className={`flex-1 text-base ${active ? 'font-bold text-primary' : 'font-medium text-ink'}`}
      >
        {link.label}
      </Text>
      {link.badge ? (
        <View className="h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1.5">
          <Text className="text-xs font-bold text-white">{link.badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

/** Contenido del menú lateral (Drawer). */
export function AppDrawerContent(
  props: DrawerContentComponentProps,
): React.JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const go = (href: string): void => {
    props.navigation.closeDrawer();
    router.push(href);
  };

  const confirmLogout = (): void => {
    props.navigation.closeDrawer();
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
    <DrawerContentScrollView
      {...props}
      style={{ backgroundColor: '#FFFFFF' }}
      contentContainerStyle={{ flexGrow: 1, paddingTop: 0 }}
    >
      {user ? (
        <View className="flex-row items-center gap-3 border-b border-line px-5 pb-4 pt-1">
          <Avatar uri={user.avatarUrl} size={52} />
          <View className="flex-1">
            <Text className="text-base font-bold text-ink" numberOfLines={1}>
              {user.name}
            </Text>
            <Text className="text-xs font-semibold uppercase tracking-wide text-primary">
              Entrenador Personal
            </Text>
            <Text className="text-xs text-ink-faint" numberOfLines={1}>
              {user.email}
            </Text>
          </View>
        </View>
      ) : null}

      <View className="gap-0.5 px-3 py-2">
        {PRIMARY_LINKS.map((link) => (
          <DrawerItem
            key={link.href}
            link={link}
            active={isActive(pathname, link.match)}
            onPress={() => go(link.href)}
          />
        ))}
      </View>

      <View className="flex-1" />

      <View className="gap-0.5 border-t border-line px-3 pb-1 pt-2">
        <DrawerItem
          link={{
            label: 'Ayuda y Soporte',
            icon: 'help-circle-outline',
            href: '/(app)/support',
            match: ['/support'],
          }}
          active={isActive(pathname, ['/support'])}
          onPress={() => go('/(app)/support')}
        />
        <Pressable
          accessibilityRole="button"
          onPress={confirmLogout}
          className="flex-row items-center gap-4 rounded-xl px-4 py-3 active:bg-rose-50"
        >
          <Ionicons name="log-out-outline" size={22} color="#E11D48" />
          <Text className="text-base font-semibold text-rose-600">Cerrar Sesión</Text>
        </Pressable>
        <Text className="px-4 pb-1 pt-2 text-xs text-ink-faint">NavyTeam v1.0</Text>
      </View>
    </DrawerContentScrollView>
  );
}
