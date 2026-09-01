import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

function tabIcon(active: IoniconName, inactive: IoniconName) {
  return ({ color, focused }: { color: ColorValue; focused: boolean }) => (
    <Ionicons name={focused ? active : inactive} size={22} color={color} />
  );
}

export default function TabsLayout(): React.JSX.Element {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: { borderTopColor: '#E2E8F0' },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
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
