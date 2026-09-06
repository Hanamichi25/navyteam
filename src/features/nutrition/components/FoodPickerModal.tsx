import { useMemo, useState } from 'react';
import { Modal, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FeedbackState } from '@/components/FeedbackState';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SearchField } from '@/components/SearchField';
import { FoodListItem, useFoods } from '@/features/foods';

interface FoodPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onPick: (foodId: string) => void;
}

/** Modal para elegir un alimento del catálogo (mismo patrón que el picker de ejercicios). */
export function FoodPickerModal({ visible, onClose, onPick }: FoodPickerModalProps): React.JSX.Element {
  const foods = useFoods();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (foods.status !== 'ready') return [];
    const q = query.trim().toLowerCase();
    if (!q) return foods.data;
    return foods.data.filter((food) => food.name.toLowerCase().includes(q));
  }, [foods, query]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
        <ScreenHeader title="Elegir Alimento" centered onBack={onClose} />

        <View className="flex-row items-center px-5 pb-3">
          <SearchField value={query} onChangeText={setQuery} placeholder="Buscar alimento" />
        </View>

        {foods.status === 'loading' ? (
          <FeedbackState variant="loading" />
        ) : foods.status === 'error' ? (
          <FeedbackState variant="error" message={foods.error} />
        ) : filtered.length === 0 ? (
          <FeedbackState variant="empty" message="No hay alimentos que coincidan. Créalos en Alimentos." />
        ) : (
          <ScrollView contentContainerClassName="gap-3 px-5 pb-6" showsVerticalScrollIndicator={false}>
            {filtered.map((food) => (
              <FoodListItem key={food.id} food={food} onPress={() => onPick(food.id)} />
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}
