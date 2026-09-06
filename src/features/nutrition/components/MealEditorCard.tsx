import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, TextInput, View } from 'react-native';

import { COLORS } from '@/lib/colors';
import type { Food } from '@/types/food';
import { MEAL_NAME_SUGGESTIONS, type MealDraft } from '../mealDraft';
import { MealItemRow } from './MealItemRow';

interface MealEditorCardProps {
  meal: MealDraft;
  index: number;
  foodsById: Map<string, Food>;
  mealKcal: number;
  expanded: boolean;
  onToggle: () => void;
  onChangeName: (name: string) => void;
  onAddFood: () => void;
  onChangeItemQuantity: (itemId: string, value: number | null) => void;
  onRemoveItem: (itemId: string) => void;
  onRemoveMeal: () => void;
}

/**
 * Tarjeta de una comida en el editor: cabecera siempre visible (nº + nombre +
 * resumen `N alimentos · kcal`) y contenido editable al desplegar.
 */
export function MealEditorCard({
  meal,
  index,
  foodsById,
  mealKcal,
  expanded,
  onToggle,
  onChangeName,
  onAddFood,
  onChangeItemQuantity,
  onRemoveItem,
  onRemoveMeal,
}: MealEditorCardProps): React.JSX.Element {
  const itemCount = meal.items.length;

  return (
    <View className="overflow-hidden rounded-2xl border border-line bg-surface">
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`${meal.name || 'Comida sin nombre'}, ${mealKcal} kcal`}
        onPress={onToggle}
        className="flex-row items-center gap-3 p-3.5 active:bg-surface-subtle"
      >
        <View className="h-7 w-7 items-center justify-center rounded-full bg-primary">
          <Text className="text-xs font-bold text-white">{index + 1}</Text>
        </View>
        <View className="h-9 w-9 items-center justify-center rounded-xl bg-primary-light">
          <Ionicons name="restaurant-outline" size={17} color={COLORS.primary} />
        </View>
        <View className="flex-1">
          <Text
            className={`text-sm font-bold ${meal.name.trim() ? 'text-ink' : 'text-ink-faint'}`}
            numberOfLines={1}
          >
            {meal.name.trim() || 'Comida sin nombre'}
          </Text>
          <Text className="text-xs text-ink-faint">
            {itemCount} {itemCount === 1 ? 'alimento' : 'alimentos'}
          </Text>
        </View>
        {expanded ? null : (
          <Text className="text-xs font-semibold text-ink-muted">{mealKcal} kcal</Text>
        )}
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={COLORS.inkFaint}
        />
      </Pressable>

      {expanded ? (
        <View className="gap-3 border-t border-line bg-surface-subtle p-4">
          <TextInput
            className="h-10 rounded-xl border border-line bg-surface px-3 text-base font-semibold text-ink"
            value={meal.name}
            onChangeText={onChangeName}
            placeholder="Nombre de la comida"
            placeholderTextColor="#94A3B8"
          />

          {meal.name === '' ? (
            <View className="flex-row flex-wrap gap-2">
              {MEAL_NAME_SUGGESTIONS.map((s) => (
                <Pressable
                  key={s}
                  accessibilityRole="button"
                  onPress={() => onChangeName(s)}
                  className="rounded-full border border-line bg-surface px-3 py-1 active:bg-surface-subtle"
                >
                  <Text className="text-xs font-semibold text-ink-muted">{s}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          {meal.items.length === 0 ? (
            <Text className="text-sm text-ink-faint">Sin alimentos todavía.</Text>
          ) : (
            <View className="gap-2">
              {meal.items.map((item) => (
                <MealItemRow
                  key={item.id}
                  item={item}
                  food={foodsById.get(item.foodId)}
                  onChangeQuantity={(v) => onChangeItemQuantity(item.id, v)}
                  onRemove={() => onRemoveItem(item.id)}
                />
              ))}
            </View>
          )}

          <View className="flex-row items-center justify-between">
            <Pressable
              accessibilityRole="button"
              onPress={onAddFood}
              className="flex-row items-center gap-1.5 rounded-full bg-primary-light px-3 py-1.5"
            >
              <Ionicons name="add" size={16} color={COLORS.primary} />
              <Text className="text-sm font-semibold text-primary">Añadir alimento</Text>
            </Pressable>
            <Text className="text-sm font-bold text-ink">{mealKcal} kcal</Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Quitar comida"
            onPress={onRemoveMeal}
            className="flex-row items-center gap-1.5 self-start rounded-lg px-2 py-1.5 active:bg-rose-50"
          >
            <Ionicons name="trash-outline" size={15} color="#E11D48" />
            <Text className="text-xs font-semibold text-rose-600">Quitar comida</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
