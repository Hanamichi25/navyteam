import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '@/lib/colors';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

function tabIcon(active: IoniconName, inactive: IoniconName) {
  return ({ color, focused }: { color: ColorValue; focused: boolean }) => (
    <Ionicons name={focused ? active : inactive} size={22} color={color} />
  );
}

export default function TabsLayout(): React.JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.inkFaint,
        // Altura + paddings explícitos: cada tab item es un flex column (ícono +
        // label) con altura fija; el ícono tiene flexShrink:0, así que si no sobra
        // espacio de sobra, todo el "apriete" lo absorbe el label y el texto se
        // termina aplastando a unos pocos px (ilegible) en vez de crecer el alto.
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
        name="dashboard"
        options={{ title: 'Inicio', tabBarIcon: tabIcon('home', 'home-outline') }}
      />
      <Tabs.Screen
        name="clients"
        options={{ title: 'Usuarios', tabBarIcon: tabIcon('people', 'people-outline') }}
      />
      <Tabs.Screen
        name="routines"
        options={{ title: 'Rutinas', tabBarIcon: tabIcon('barbell', 'barbell-outline') }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: 'Alimentación',
          tabBarIcon: tabIcon('nutrition', 'nutrition-outline'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Perfil', tabBarIcon: tabIcon('person', 'person-outline') }}
      />
    </Tabs>
  );
}
