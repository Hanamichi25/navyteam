import { Text, TextInput, View, type KeyboardTypeOptions } from 'react-native';

interface TextFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  editable?: boolean;
}

/** Campo de texto genérico para formularios (RHF `Controller`). */
export function TextField({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  error,
  keyboardType,
  multiline = false,
  editable = true,
}: TextFieldProps): React.JSX.Element {
  const hasError = Boolean(error);

  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-ink">{label}</Text>

      <TextInput
        className={[
          'rounded-2xl border px-4 text-base text-ink',
          multiline ? 'min-h-24 py-3' : 'h-14',
          hasError ? 'border-red-400 bg-red-50' : 'border-line bg-surface-field',
        ].join(' ')}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        keyboardType={keyboardType}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        editable={editable}
      />

      {hasError ? <Text className="text-sm text-red-500">{error}</Text> : null}
    </View>
  );
}
