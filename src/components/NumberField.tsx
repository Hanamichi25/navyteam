import { Text, TextInput, View } from 'react-native';

interface NumberFieldProps {
  label: string;
  /** `null` representa el campo vacío (distinto de `0`). */
  value: number | null;
  onChange: (value: number | null) => void;
  onBlur?: () => void;
  placeholder?: string;
  suffix?: string;
  error?: string;
  editable?: boolean;
}

/** Campo numérico genérico para formularios (RHF `Controller`). */
export function NumberField({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  suffix,
  error,
  editable = true,
}: NumberFieldProps): React.JSX.Element {
  const hasError = Boolean(error);

  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-ink">{label}</Text>

      <View
        className={[
          'h-14 flex-row items-center gap-2 rounded-2xl border px-4',
          hasError ? 'border-red-400 bg-red-50' : 'border-line bg-surface-field',
        ].join(' ')}
      >
        <TextInput
          className="flex-1 text-base text-ink"
          value={value === null ? '' : String(value)}
          onChangeText={(text) => {
            const digitsOnly = text.replace(/[^0-9]/g, '');
            onChange(digitsOnly === '' ? null : Number(digitsOnly));
          }}
          onBlur={onBlur}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
          editable={editable}
        />
        {suffix ? <Text className="text-sm font-semibold text-ink-faint">{suffix}</Text> : null}
      </View>

      {hasError ? <Text className="text-sm text-red-500">{error}</Text> : null}
    </View>
  );
}
