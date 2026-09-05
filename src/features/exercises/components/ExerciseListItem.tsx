import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { COLORS } from '@/lib/colors';
import type { Exercise, MuscleGroup } from '@/types/exercise';
import { MUSCLE_GROUP_LABEL } from '../labels';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const MUSCLE_GROUP_ICON: Record<MuscleGroup, IoniconName> = {
  chest: 'body-outline',
  back: 'body-outline',
  legs: 'walk-outline',
  shoulders: 'body-outline',
  arms: 'barbell-outline',
  core: 'ellipse-outline',
  cardio: 'heart-outline',
  full_body: 'body-outline',
};

interface ExerciseListItemProps {
  exercise: Exercise;
  onPress?: () => void;
}

/** Fila de un ejercicio del catálogo: icono por grupo muscular + nombre + equipo. */
export function ExerciseListItem({ exercise, onPress }: ExerciseListItemProps): React.JSX.Element {
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
      {onPress ? <Ionicons name="chevron-forward" size={18} color="#94A3B8" /> : null}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      {content}
    </Pressable>
  );
}
