import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { COLORS } from '@/lib/colors';
import type { Exercise } from '@/types/exercise';
import { MUSCLE_GROUP_ICON, MUSCLE_GROUP_LABEL } from '../labels';

interface ExerciseListItemProps {
  exercise: Exercise;
  onPress?: () => void;
  /** Contenido al final de la fila; reemplaza el chevron por defecto. */
  rightSlot?: ReactNode;
}

/** Fila de un ejercicio del catálogo: icono por grupo muscular + nombre + equipo. */
export function ExerciseListItem({
  exercise,
  onPress,
  rightSlot,
}: ExerciseListItemProps): React.JSX.Element {
  const content = (
    <View className="flex-row items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3">
      <View className="h-10 w-10 items-center justify-center rounded-lg bg-primary-light">
        <Ionicons name={MUSCLE_GROUP_ICON[exercise.muscleGroup]} size={18} color={COLORS.primary} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-bold text-ink">{exercise.name}</Text>
        <Text className="text-xs text-ink-faint">
          {MUSCLE_GROUP_LABEL[exercise.muscleGroup]} · {exercise.equipment}
        </Text>
      </View>
      {rightSlot ?? (onPress ? <Ionicons name="chevron-forward" size={18} color="#94A3B8" /> : null)}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      {content}
    </Pressable>
  );
}
