import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface NavItem {
  key: string;
  label: string;
  icon: IoniconName;
}

const NAV_ITEMS: readonly NavItem[] = [
  { key: 'home', label: 'Inicio', icon: 'home' },
  { key: 'users', label: 'Usuarios', icon: 'people-outline' },
  { key: 'routines', label: 'Rutinas', icon: 'barbell-outline' },
  { key: 'nutrition', label: 'Alimentación', icon: 'nutrition-outline' },
  { key: 'profile', label: 'Perfil', icon: 'person-outline' },
];

/**
 * Barra de navegación inferior (presentacional).
 *
 * Solo "Inicio" está activo en esta fase. Las demás secciones se implementan
 * como pestañas reales de Expo Router en fases posteriores.
 */
export function BottomNav(): React.JSX.Element {
  const activeKey = 'home';

  return (
    <View className="flex-row border-t border-line bg-surface px-2 pt-2">
      {NAV_ITEMS.map((item) => {
        const isActive = item.key === activeKey;
        const color = isActive ? '#2563EB' : '#94A3B8';
        return (
          <View key={item.key} className="flex-1 items-center gap-1 py-1">
            <Ionicons name={item.icon} size={22} color={color} />
            <Text
              className={`text-[11px] ${isActive ? 'font-semibold text-primary' : 'text-ink-faint'}`}
            >
              {item.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
