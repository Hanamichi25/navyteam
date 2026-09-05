import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { COLORS } from '@/lib/colors';
import { openDrawer } from '@/lib/openDrawer';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface HeaderAction {
  iconName: IoniconName;
  onPress: () => void;
  accessibilityLabel: string;
}

interface ScreenHeaderProps {
  title: string;
  /** Muestra flecha de retroceso a la izquierda. */
  onBack?: () => void;
  /**
   * Handler del botón de menú (☰). Si no se pasa `onBack`, el ☰ se muestra
   * SIEMPRE: sin `onMenu` explícito abre el Drawer por defecto. Ignorado si se
   * pasa `onBack`.
   */
  onMenu?: () => void;
  /** Botón de icono a la derecha (filtro, menú contextual...). */
  action?: HeaderAction;
  /** Título centrado y más pequeño (pantallas de detalle). Por defecto grande y a la izquierda. */
  centered?: boolean;
}

function IconButton({
  iconName,
  onPress,
  accessibilityLabel,
}: HeaderAction): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className="h-10 w-10 items-center justify-center rounded-lg border border-line bg-surface active:bg-surface-subtle"
    >
      <Ionicons name={iconName} size={20} color={COLORS.ink} />
    </Pressable>
  );
}

/** Encabezado de pantalla reutilizable para listas y detalles. */
export function ScreenHeader({
  title,
  onBack,
  onMenu,
  action,
  centered = false,
}: ScreenHeaderProps): React.JSX.Element {
  const navigation = useNavigation();

  return (
    <View className="flex-row items-center justify-between gap-3 px-5 py-3">
      <View className="min-w-[40px] flex-row items-center">
        {onBack ? (
          <IconButton
            iconName="arrow-back"
            onPress={onBack}
            accessibilityLabel="Volver"
          />
        ) : (
          <IconButton
            iconName="menu"
            onPress={onMenu ?? (() => openDrawer(navigation))}
            accessibilityLabel="Abrir menú"
          />
        )}
      </View>

      <Text
        className={
          centered
            ? 'flex-1 text-center text-lg font-bold text-ink'
            : 'flex-1 text-xl font-extrabold text-ink'
        }
        numberOfLines={1}
      >
        {title}
      </Text>

      <View className="min-w-[40px] flex-row items-center justify-end">
        {action ? <IconButton {...action} /> : null}
      </View>
    </View>
  );
}
