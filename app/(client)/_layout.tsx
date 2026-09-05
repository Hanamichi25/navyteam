import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuthStore } from '@/features/auth';
import { COLORS } from '@/lib/colors';

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
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.inkFaint,
        tabBarStyle: {
          borderTopColor: COLORS.line,
          height: 76 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom + 8,
        },
        // fontWeight no sintetiza Manrope (fuente custom, un archivo por peso):
        // fontFamily explícito, igual que las clases font-* de NativeWind.
        tabBarLabelStyle: { fontSize: 11, fontFamily: 'Manrope_700Bold' },
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
