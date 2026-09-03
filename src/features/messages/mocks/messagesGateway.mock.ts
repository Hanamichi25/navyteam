import { delay } from '@/lib/delay';
import { createId } from '@/lib/id';
import { readJSON, writeJSON } from '@/lib/storage';
import type { CoachThreadSummary, Message, MessageInput } from '@/types/message';

import type { MessagesGateway } from '../gateway';
import { MESSAGES_SEED } from './messages.mock';

const STORAGE_KEY = '@navyteam/messages';

async function readAll(): Promise<Message[]> {
  return readJSON<Message[]>(STORAGE_KEY, [...MESSAGES_SEED]);
}

function byDateAsc(a: Message, b: Message): number {
  return a.sentAt.localeCompare(b.sentAt);
}

/**
 * Implementación mock del `MessagesGateway`: persiste en AsyncStorage,
 * sembrando desde `messages.mock.ts` la primera vez. Simula latencia y
 * conserva un caso de error (`listByClient('')`).
 *
 * TODO(backend): con AsyncStorage el hilo es local al dispositivo; el
 * intercambio real entre entrenador y cliente en distintos dispositivos
 * llega con el backend (Fase 10).
 */
export function createMockMessagesGateway(): MessagesGateway {
  return {
    async listByClient(clientId) {
      await delay(450);
      if (!clientId) {
        throw new Error('No se pudo cargar la conversación: cliente no válido.');
      }
      const all = await readAll();
      return all.filter((message) => message.clientId === clientId).sort(byDateAsc);
    },

    async send(input: MessageInput) {
      await delay(300);
      const all = await readAll();
      const message: Message = {
        id: createId('msg'),
        clientId: input.clientId,
        sender: input.sender,
        text: input.text.trim(),
        sentAt: new Date().toISOString(),
      };
      await writeJSON(STORAGE_KEY, [...all, message]);
      return message;
    },

    async coachThreads() {
      await delay(500);
      const all = await readAll();
      const lastByClient = new Map<string, Message>();
      for (const message of [...all].sort(byDateAsc)) {
        lastByClient.set(message.clientId, message);
      }

      const threads: CoachThreadSummary[] = [];
      for (const [clientId, last] of lastByClient) {
        threads.push({
          clientId,
          lastText: last.text,
          lastAt: last.sentAt,
          lastSender: last.sender,
        });
      }
      return threads.sort((a, b) => b.lastAt.localeCompare(a.lastAt));
    },
  };
}
