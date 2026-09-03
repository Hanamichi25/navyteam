import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, Text, View } from 'react-native';

import { Badge } from '@/components/Badge';
import type { Routine } from '@/types/routine';
import { ROUTINE_LEVEL_LABEL } from '../labels';
import { routineBanner } from '../routineImages';

interface RoutineCardProps {
  routine: Routine;
  onPress?: () => void;
}

/** Tarjeta del catálogo de rutinas: portada + metadatos. */
export function RoutineCard({ routine, onPress }: RoutineCardProps): React.JSX.Element {
  const content = (
    <View className="overflow-hidden rounded-2xl border border-line bg-surface">
      {/* Contenedor con alto fijo + imagen absoluta al 100%: es la forma
          fiable en react-native-web (un <Image>/<ImageBackground> suelto se
          renderiza a su ancho intrínseco y se recorta mal). El banner es
          960×400 (2.4:1) recortado desde arriba (titular visible). */}
      <View className="w-full overflow-hidden bg-ink" style={{ height: 148 }}>
        <Image
          source={routineBanner(routine.id)}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
        <Badge
          label={ROUTINE_LEVEL_LABEL[routine.level]}
          tone="primary"
          className="absolute bottom-3 right-3"
        />
      </View>

      <View className="gap-2 p-4">
        <Text className="text-base font-bold text-ink">{routine.name}</Text>

        <View className="flex-row items-center gap-4">
          <View className="flex-row items-center gap-1.5">
            <Ionicons name="time-outline" size={15} color="#64748B" />
            <Text className="text-sm text-ink-muted">{routine.durationMin} min</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <Ionicons name="barbell-outline" size={15} color="#64748B" />
            <Text className="text-sm text-ink-muted">
              {routine.exerciseCount} ejercicios
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-1.5">
          <Ionicons name="people-outline" size={15} color="#94A3B8" />
          <Text className="text-xs text-ink-faint">
            Asignada a {routine.assignedCount} usuarios
          </Text>
        </View>
      </View>
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      {content}
    </Pressable>
  );
}
