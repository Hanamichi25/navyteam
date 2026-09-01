import { Ionicons } from '@expo/vector-icons';
import { Image, Text, View } from 'react-native';

import { Badge } from '@/components/Badge';
import type { Routine } from '@/types/routine';
import { ROUTINE_LEVEL_LABEL } from '../labels';

interface RoutineCardProps {
  routine: Routine;
}

/** Tarjeta del catálogo de rutinas: portada + metadatos. */
export function RoutineCard({ routine }: RoutineCardProps): React.JSX.Element {
  return (
    <View className="overflow-hidden rounded-2xl border border-line bg-surface">
      <View>
        <Image
          source={{ uri: routine.imageUrl }}
          className="h-32 w-full bg-surface-field"
          resizeMode="cover"
        />
        <Badge
          label={ROUTINE_LEVEL_LABEL[routine.level]}
          tone="primary"
          className="absolute left-3 top-3"
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
}
