import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Fab } from '@/components/Fab';
import { FeedbackState } from '@/components/FeedbackState';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SearchField } from '@/components/SearchField';
import { ClientListItem, useClients } from '@/features/clients';

export default function ClientsScreen(): React.JSX.Element {
  const router = useRouter();
  const clients = useClients();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (clients.status !== 'ready') return [];
    const q = query.trim().toLowerCase();
    if (!q) return clients.data;
    return clients.data.filter((client) => client.name.toLowerCase().includes(q));
  }, [clients, query]);

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <ScreenHeader title="Mis Usuarios" />

      <View className="flex-row items-center gap-3 px-5 pb-3">
        <SearchField
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar usuario..."
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Filtrar usuarios"
          onPress={() => {
            // TODO(backend): abrir panel de filtros (objetivo, actividad).
          }}
          className="h-12 w-12 items-center justify-center rounded-2xl border border-line bg-surface active:bg-surface-subtle"
        >
          <Ionicons name="options-outline" size={20} color="#0F172A" />
        </Pressable>
      </View>

      {clients.status === 'loading' ? (
        <FeedbackState variant="loading" />
      ) : clients.status === 'error' ? (
        <FeedbackState variant="error" message={clients.error} />
      ) : filtered.length === 0 ? (
        <FeedbackState
          variant="empty"
          message="No hay usuarios que coincidan con tu búsqueda."
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(client) => client.id}
          contentContainerClassName="px-5 pb-24 gap-3"
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ClientListItem
              client={item}
              onPress={() => router.push(`/(app)/(tabs)/clients/${item.id}`)}
            />
          )}
        />
      )}

      <Fab
        accessibilityLabel="Añadir usuario"
        onPress={() => router.push('/(app)/(tabs)/clients/new')}
      />
    </SafeAreaView>
  );
}
