import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useMessagesGateway } from '@/gateways';
import { toAsyncState, type AsyncState } from '@/lib/queryState';
import type { CoachThreadSummary, Message, MessageSender } from '@/types/message';

const threadKey = (clientId: string) => ['messages', clientId] as const;
const threadsKey = ['messages', 'threads'] as const;

/** Hilo de mensajes de un cliente (orden ascendente). */
export function useThread(clientId: string): AsyncState<Message[]> {
  const gateway = useMessagesGateway();
  return toAsyncState(
    useQuery({
      queryKey: threadKey(clientId),
      queryFn: () => gateway.listByClient(clientId),
      enabled: clientId !== '',
    }),
    'No se pudo cargar la conversación',
  );
}

/** Resúmenes de todos los hilos con mensajes (lista del entrenador). */
export function useCoachThreads(): AsyncState<CoachThreadSummary[]> {
  const gateway = useMessagesGateway();
  return toAsyncState(
    useQuery({ queryKey: threadsKey, queryFn: () => gateway.coachThreads() }),
    'No se pudieron cargar los mensajes',
  );
}

/** Envía un mensaje al hilo del cliente e invalida el hilo + la lista. */
export function useSendMessage() {
  const gateway = useMessagesGateway();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { clientId: string; sender: MessageSender; text: string }) =>
      gateway.send(input),
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: threadKey(input.clientId) });
      queryClient.invalidateQueries({ queryKey: threadsKey });
    },
  });
}
