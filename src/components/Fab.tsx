import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';

interface FabProps {
  onPress: () => void;
  accessibilityLabel: string;
  iconName?: React.ComponentProps<typeof Ionicons>['name'];
}

/** Botón de acción flotante (esquina inferior derecha). */
export function Fab({
  onPress,
  accessibilityLabel,
  iconName = 'add',
}: FabProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className="absolute bottom-6 right-5 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/40 active:bg-primary-dark"
    >
      <Ionicons name={iconName} size={26} color="#FFFFFF" />
    </Pressable>
  );
}
