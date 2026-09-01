import { Ionicons } from '@expo/vector-icons';
import { TextInput, View } from 'react-native';

interface SearchFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

/** Campo de búsqueda con icono de lupa. */
export function SearchField({
  value,
  onChangeText,
  placeholder = 'Buscar...',
}: SearchFieldProps): React.JSX.Element {
  return (
    <View className="h-12 flex-1 flex-row items-center gap-2 rounded-2xl border border-line bg-surface-field px-4">
      <Ionicons name="search" size={18} color="#94A3B8" />
      <TextInput
        className="flex-1 text-base text-ink"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
    </View>
  );
}
