import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { useRef } from 'react';
import { Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

interface SwipeToDismissProps {
  onDismiss: () => void;
  children: ReactNode;
  /** Texto de la acción revelada al deslizar. Por defecto "Ocultar". */
  label?: string;
  /** Icono de la acción. Por defecto `eye-off-outline`. */
  iconName?: IoniconName;
}

/**
 * Envuelve una fila para poder accionarla deslizándola hacia la izquierda.
 * Al abrirse hacia la derecha (revelar la acción) dispara `onDismiss`.
 * Requiere `GestureHandlerRootView` en la raíz (ya montado en `app/_layout.tsx`).
 */
export function SwipeToDismiss({
  onDismiss,
  children,
  label = 'Ocultar',
  iconName = 'eye-off-outline',
}: SwipeToDismissProps): React.JSX.Element {
  const ref = useRef<Swipeable>(null);

  return (
    <Swipeable
      ref={ref}
      friction={1.6}
      rightThreshold={48}
      overshootRight={false}
      renderRightActions={() => (
        <View className="my-0.5 flex-row items-center justify-end gap-1.5 rounded-xl bg-rose-500 px-4">
          <Ionicons name={iconName} size={16} color="#fff" />
          <Text className="text-sm font-semibold text-white">{label}</Text>
        </View>
      )}
      onSwipeableOpen={(direction) => {
        if (direction === 'right') {
          onDismiss();
          ref.current?.close();
        }
      }}
    >
      {children}
    </Swipeable>
  );
}
