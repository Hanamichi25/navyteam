import { Text, TextInput, View } from 'react-native';

interface DateFieldProps {
  label: string;
  /** Texto en formato `dd/mm/aaaa`. La validación de fecha real va en el schema Zod del formulario. */
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  error?: string;
  editable?: boolean;
}

/**
 * Campo de fecha por entrada de texto (`dd/mm/aaaa`).
 * TODO(Fase 6): evaluar un date-picker nativo si hace falta mejor UX al
 * elegir la fecha de nacimiento del cliente.
 */
export function DateField({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  editable = true,
}: DateFieldProps): React.JSX.Element {
  const hasError = Boolean(error);

  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-ink">{label}</Text>

      <TextInput
        className={[
          'h-14 rounded-2xl border px-4 text-base text-ink',
          hasError ? 'border-red-400 bg-red-50' : 'border-line bg-surface-field',
        ].join(' ')}
        value={value}
        onChangeText={(text) => onChangeText(text.replace(/[^0-9/]/g, ''))}
        onBlur={onBlur}
        placeholder="dd/mm/aaaa"
        placeholderTextColor="#94A3B8"
        keyboardType="numbers-and-punctuation"
        maxLength={10}
        editable={editable}
      />

      {hasError ? <Text className="text-sm text-red-500">{error}</Text> : null}
    </View>
  );
}
