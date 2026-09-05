import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { COLORS } from '@/lib/colors';

interface CollapsibleSectionProps {
  title: string;
  /** Texto corto a la derecha del título, visible incluso colapsada (ej: "65 kg"). */
  summary?: string;
  /** Elemento a la derecha del título en vez de `summary` (ej: un `Badge` de estado). */
  headerRight?: ReactNode;
  /** Ícono del título. */
  iconName?: React.ComponentProps<typeof Ionicons>['name'];
  /** Abierta por defecto. Por defecto cerrada. */
  defaultOpen?: boolean;
  children: ReactNode;
}

/** Card con cabecera siempre visible (título + resumen) y contenido colapsable. */
export function CollapsibleSection({
  title,
  summary,
  headerRight,
  iconName,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps): React.JSX.Element {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <View className="overflow-hidden rounded-xl bg-surface-subtle">
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${title}${summary ? `, ${summary}` : ''}`}
        onPress={() => setOpen((value) => !value)}
        className="flex-row items-center gap-2.5 p-4 active:bg-surface-field"
      >
        {iconName ? (
          <View className="h-8 w-8 items-center justify-center rounded-lg bg-primary-light">
            <Ionicons name={iconName} size={16} color={COLORS.primary} />
          </View>
        ) : null}
        <Text className="flex-1 text-sm font-bold text-ink">{title}</Text>
        {headerRight}
        {summary ? (
          <Text className="text-xs font-semibold text-ink-muted" numberOfLines={1}>
            {summary}
          </Text>
        ) : null}
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={COLORS.inkFaint}
        />
      </Pressable>

      {open ? <View className="gap-3 px-4 pb-4">{children}</View> : null}
    </View>
  );
}
