import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuthStore } from '@/features/auth';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

function tabIcon(active: IoniconName, inactive: IoniconName) {
  return ({ color, focused }: { color: ColorValue; focused: boolean }) => (
    <Ionicons name={focused ? active : inactive} size={22} color={color} />
  );
}

/**
 * Área del **cliente** (Fase 8). Tabs simples, sin Drawer. Redirige a Login si no
 * hay sesión y al panel del entrenador si el usuario no es un cliente.
 */
export default function ClientLayout(): React.JSX.Element {
  const user = useAuthStore((state) => state.user);
  const insets = useSafeAreaInsets();

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }
  if (user.role !== 'client') {
    return <Redirect href="/(app)/(tabs)/dashboard" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          borderTopColor: '#E2E8F0',
          height: 76 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom + 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarItemStyle: { paddingVertical: 2 },
      }}
    >
      <Tabs.Screen
        name="routine"
        options={{ title: 'Inicio', tabBarIcon: tabIcon('home', 'home-outline') }}
      />
      <Tabs.Screen name="messages" options={{ href: null }} />
      <Tabs.Screen
        name="nutrition"
        options={{ title: 'Alimentación', tabBarIcon: tabIcon('nutrition', 'nutrition-outline') }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: 'Mis entrenos',
          tabBarIcon: tabIcon('checkmark-done', 'checkmark-done-outline'),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{ title: 'Cuenta', tabBarIcon: tabIcon('person', 'person-outline') }}
      />
    </Tabs>
  );
}
