import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Pressable,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type TextInputProps,
} from 'react-native';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  /** Icono a la izquierda del campo. */
  iconName: IoniconName;
  /** Si es `true`, oculta el texto y muestra el botón de mostrar/ocultar. */
  secureTextEntry?: boolean;
  /** Mensaje de error; si está presente el campo se resalta en rojo. */
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoComplete?: TextInputProps['autoComplete'];
  editable?: boolean;
}

export function Input({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  iconName,
  secureTextEntry = false,
  error,
  keyboardType,
  autoCapitalize = 'none',
  autoComplete,
  editable = true,
}: InputProps): React.JSX.Element {
  const [isHidden, setIsHidden] = useState(secureTextEntry);
  const hasError = Boolean(error);

  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-ink">{label}</Text>

      <View
        className={[
          'h-14 flex-row items-center gap-3 rounded-2xl border px-4',
          hasError ? 'border-red-400 bg-red-50' : 'border-line bg-surface-field',
        ].join(' ')}
      >
        <Ionicons
          name={iconName}
          size={20}
          color={hasError ? '#F87171' : '#94A3B8'}
        />

        <TextInput
          className="flex-1 text-base text-ink"
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          secureTextEntry={isHidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          editable={editable}
        />

        {secureTextEntry ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isHidden ? 'Mostrar contraseña' : 'Ocultar contraseña'}
            hitSlop={8}
            onPress={() => setIsHidden((prev) => !prev)}
          >
            <Ionicons
              name={isHidden ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color="#94A3B8"
            />
          </Pressable>
        ) : null}
      </View>

      {hasError ? <Text className="text-sm text-red-500">{error}</Text> : null}
    </View>
  );
}
