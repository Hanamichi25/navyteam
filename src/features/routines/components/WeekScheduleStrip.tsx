import { Text, View } from 'react-native';

import { WEEKDAY_LETTERS, weekdayIndexMonday } from '@/lib/date';
import { parseSchedule } from '@/lib/schedule';

interface WeekScheduleStripProps {
  /** Horarios de las rutinas asignadas (ej: `["Lun/Mié/Vie"]`). */
  schedules: readonly string[];
}

/** Fila de 7 días marcando en cuáles entrena el cliente y en cuál está hoy. */
export function WeekScheduleStrip({
  schedules,
}: WeekScheduleStripProps): React.JSX.Element {
  const today = weekdayIndexMonday();
  const trainingDays = new Set<number>();
  for (const schedule of schedules) {
    for (const day of parseSchedule(schedule)) trainingDays.add(day);
  }

  return (
    <View className="flex-row justify-between">
      {WEEKDAY_LETTERS.map((letter, index) => {
        const trains = trainingDays.has(index);
        const isToday = index === today;
        return (
          <View
            key={letter}
            className={[
              'h-11 w-9 items-center justify-center gap-1 rounded-xl border',
              isToday
                ? 'border-primary bg-primary'
                : trains
                  ? 'border-line bg-primary-light'
                  : 'border-line bg-surface',
            ].join(' ')}
          >
            <Text
              className={`text-xs font-bold ${
                isToday ? 'text-white' : trains ? 'text-primary' : 'text-ink-faint'
              }`}
            >
              {letter}
            </Text>
            <View
              className={`h-1 w-1 rounded-full ${
                isToday ? 'bg-white' : trains ? 'bg-primary' : 'bg-line'
              }`}
            />
          </View>
        );
      })}
    </View>
  );
}
