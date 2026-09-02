import { Text, View } from 'react-native';

import { todayLongLabel } from '@/lib/date';

/** Tira superior con la fecha de hoy. Se usa como cabecera del área de cliente. */
export function DateStrip(): React.JSX.Element {
  return (
    <View className="border-b border-line bg-surface-subtle px-5 py-3">
      <Text className="text-base font-extrabold text-ink">{todayLongLabel()}</Text>
    </View>
  );
}
