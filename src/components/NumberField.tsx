import { useEffect, useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';

interface NumberFieldProps {
  /** Etiqueta encima del campo. Omitir para un campo compacto (ej: dentro de una fila). */
  label?: string;
  /** `null` representa el campo vacío (distinto de `0`). */
  value: number | null;
  onChange: (value: number | null) => void;
  onBlur?: () => void;
  placeholder?: string;
  suffix?: string;
  error?: string;
  editable?: boolean;
  /** Permite decimales (ej: macros de un alimento). Por defecto solo enteros. */
  decimal?: boolean;
}

/**
 * Campo numérico genérico para formularios (RHF `Controller`).
 *
 * Mantiene un buffer de texto interno para poder escribir estados intermedios
 * (`"6."`, `"0"`) sin que el valor numérico controlado los "limpie" mientras
 * se teclea.
 */
export function NumberField({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  suffix,
  error,
  editable = true,
  decimal = false,
}: NumberFieldProps): React.JSX.Element {
  const hasError = Boolean(error);
  const [text, setText] = useState(value === null ? '' : String(value));
  const focused = useRef(false);

  // Sincroniza el buffer con `value` cuando el cambio viene de fuera (reset del
  // formulario, valor calculado) y el campo no está en edición.
  useEffect(() => {
    if (!focused.current) {
      setText(value === null ? '' : String(value));
    }
  }, [value]);

  const handleChange = (raw: string): void => {
    const cleaned = decimal
      ? raw.replace(',', '.').replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
      : raw.replace(/[^0-9]/g, '');
    setText(cleaned);
    if (cleaned === '' || cleaned === '.') {
      onChange(null);
      return;
    }
    const n = Number(cleaned);
    onChange(Number.isNaN(n) ? null : n);
  };

  return (
    <View className="gap-2">
      {label ? <Text className="text-sm font-semibold text-ink">{label}</Text> : null}

      <View
        className={[
          'h-14 flex-row items-center gap-2 rounded-2xl border px-4',
          hasError ? 'border-red-400 bg-red-50' : 'border-line bg-surface-field',
        ].join(' ')}
      >
        <TextInput
          className="flex-1 text-base text-ink"
          value={text}
          onChangeText={handleChange}
          onFocus={() => {
            focused.current = true;
          }}
          onBlur={() => {
            focused.current = false;
            setText(value === null ? '' : String(value));
            onBlur?.();
          }}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          keyboardType={decimal ? 'decimal-pad' : 'numeric'}
          editable={editable}
        />
        {suffix ? <Text className="text-sm font-semibold text-ink-faint">{suffix}</Text> : null}
      </View>

      {hasError ? <Text className="text-sm text-red-500">{error}</Text> : null}
    </View>
  );
}
