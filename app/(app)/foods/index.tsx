import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Fab } from '@/components/Fab';
import { FeedbackState } from '@/components/FeedbackState';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SearchField } from '@/components/SearchField';
import { FoodListItem, useFoods } from '@/features/foods';

export default function FoodsScreen(): React.JSX.Element {
  const router = useRouter();
  const foods = useFoods();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (foods.status !== 'ready') return [];
    const q = query.trim().toLowerCase();
    if (!q) return foods.data;
    return foods.data.filter((food) => food.name.toLowerCase().includes(q));
  }, [foods, query]);

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <ScreenHeader title="Alimentos" onBack={() => router.back()} />

      <View className="flex-row items-center px-5 pb-3">
        <SearchField value={query} onChangeText={setQuery} placeholder="Buscar alimento" />
      </View>

      {foods.status === 'loading' ? (
        <FeedbackState variant="loading" />
      ) : foods.status === 'error' ? (
        <FeedbackState variant="error" message={foods.error} />
      ) : filtered.length === 0 ? (
        <FeedbackState variant="empty" message="No hay alimentos que coincidan." />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(food) => food.id}
          contentContainerClassName="px-5 pb-24 gap-3"
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <FoodListItem food={item} onPress={() => router.push(`/(app)/foods/${item.id}`)} />
          )}
        />
      )}

      <Fab accessibilityLabel="Crear alimento" onPress={() => router.push('/(app)/foods/new')} />
    </SafeAreaView>
  );
}
