import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text } from 'react-native';

import { COLORS } from '@/lib/colors';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface ListRowProps {
  label: string;
  iconName: IoniconName;
  onPress: () => void;
  /** Tinte destructivo (ej: cerrar sesión). */
  destructive?: boolean;
}

/** Fila de menú: icono + etiqueta + chevron. */
export function ListRow({
  label,
  iconName,
  onPress,
  destructive = false,
}: ListRowProps): React.JSX.Element {
  const color = destructive ? '#E11D48' : COLORS.ink;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="flex-row items-center gap-4 rounded-xl border border-line bg-surface-subtle px-4 py-3.5 active:bg-surface-field"
    >
      <Ionicons name={iconName} size={20} color={color} />
      <Text
        className={`flex-1 text-base font-semibold ${destructive ? 'text-rose-600' : 'text-ink'}`}
      >
        {label}
      </Text>
      {!destructive ? (
        <Ionicons name="chevron-forward" size={18} color={COLORS.inkFaint} />
      ) : null}
    </Pressable>
  );
}
