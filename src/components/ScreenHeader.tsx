import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

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
  /** Muestra botón de menú (☰) a la izquierda. Ignorado si se pasa `onBack`. */
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
      className="h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface active:bg-surface-subtle"
    >
      <Ionicons name={iconName} size={20} color="#0F172A" />
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
  return (
    <View className="flex-row items-center justify-between gap-3 px-5 py-3">
      <View className="min-w-[40px] flex-row items-center">
        {onBack ? (
          <IconButton
            iconName="arrow-back"
            onPress={onBack}
            accessibilityLabel="Volver"
          />
        ) : onMenu ? (
          <IconButton
            iconName="menu"
            onPress={onMenu}
            accessibilityLabel="Abrir menú"
          />
        ) : null}
      </View>

      <Text
        className={
          centered
            ? 'flex-1 text-center text-lg font-bold text-ink'
            : 'flex-1 text-2xl font-extrabold text-ink'
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
