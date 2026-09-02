import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

export interface QuickAction {
  key: string;
  label: string;
  icon: IoniconName;
  onPress: () => void;
}

interface QuickActionsProps {
  actions: readonly QuickAction[];
}

/** Fila de accesos rápidos a los formularios de creación. */
export function QuickActions({ actions }: QuickActionsProps): React.JSX.Element {
  return (
    <View className="flex-row gap-2.5">
      {actions.map((action) => (
        <Pressable
          key={action.key}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          onPress={action.onPress}
          className="flex-1 items-center rounded-2xl border border-line bg-surface px-1.5 py-3 active:bg-surface-subtle"
        >
          <View className="mb-1.5 h-9 w-9 items-center justify-center rounded-full bg-primary-light">
            <Ionicons name={action.icon} size={18} color="#2563EB" />
          </View>
          <Text className="text-center text-xs font-semibold text-ink">
            {action.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
