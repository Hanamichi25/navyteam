import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from './ScreenHeader';

interface ComingSoonProps {
  title: string;
  onBack?: () => void;
  onMenu?: () => void;
}

/** Pantalla placeholder para secciones aún no construidas (Mensajes, Estadísticas...). */
export function ComingSoon({
  title,
  onBack,
  onMenu,
}: ComingSoonProps): React.JSX.Element {
  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <ScreenHeader
        title={title}
        onBack={onBack}
        onMenu={onMenu}
        centered={Boolean(onBack)}
      />
      <View className="flex-1 items-center justify-center gap-3 px-8">
        <Ionicons name="construct-outline" size={40} color="#94A3B8" />
        <Text className="text-center text-base text-ink-muted">
          Esta sección estará disponible próximamente.
        </Text>
      </View>
    </SafeAreaView>
  );
}
