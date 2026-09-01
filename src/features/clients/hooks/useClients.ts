import { useAsyncData, type AsyncState } from '@/lib/useAsyncData';
import type { Client, ClientDetail } from '@/types/client';
import { fetchMockClient, fetchMockClients } from '../mocks/clients.mock';

/** Carga la lista de clientes del entrenador. */
export function useClients(): AsyncState<Client[]> {
  return useAsyncData(fetchMockClients, [], 'No se pudieron cargar los usuarios');
}

/** Carga el detalle de un cliente por id. */
export function useClient(id: string): AsyncState<ClientDetail> {
  return useAsyncData(
    () => fetchMockClient(id),
    [id],
    'No se pudo cargar el perfil del usuario',
  );
}
