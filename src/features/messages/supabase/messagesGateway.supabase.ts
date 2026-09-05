import { createId } from '@/lib/id';
import { supabase } from '@/lib/supabase';
import { unwrapList, unwrapRequired } from '@/lib/supabaseQuery';
import type { CoachThreadSummary, Message, MessageInput, MessageSender } from '@/types/message';
import type { MessagesGateway } from '../gateway';

/**
 * Implementación real de `MessagesGateway` sobre Supabase (`messages`).
 * Un hilo por cliente; coach y cliente participan (RLS `is_my_client`).
 * Con datos reales el intercambio ya funciona entre dispositivos.
 */

interface MessageRow {
  id: string;
  client_id: string;
  sender: string;
  text: string;
  sent_at: string;
}

function rowToMessage(row: MessageRow): Message {
  return {
    id: row.id,
    clientId: row.client_id,
    sender: row.sender as MessageSender,
    text: row.text,
    sentAt: row.sent_at,
  };
}

export function createSupabaseMessagesGateway(): MessagesGateway {
  return {
    async listByClient(clientId) {
      if (!clientId) {
        throw new Error('No se pudo cargar la conversación: cliente no válido.');
      }
      const rows = unwrapList(
        await supabase
          .from('messages')
          .select('id, client_id, sender, text, sent_at')
          .eq('client_id', clientId)
          .order('sent_at', { ascending: true }),
      );
      return rows.map(rowToMessage);
    },

    async send(input: MessageInput) {
      const row = unwrapRequired(
        await supabase
          .from('messages')
          .insert({
            id: createId('msg'),
            client_id: input.clientId,
            sender: input.sender,
            text: input.text.trim(),
          })
          .select('id, client_id, sender, text, sent_at')
          .single(),
        'No se pudo enviar el mensaje',
      );
      return rowToMessage(row);
    },

    async coachThreads() {
      // RLS ya limita a los hilos de los clientes del coach. Se ordena por
      // fecha desc y se deja el primero (más reciente) de cada cliente.
      const rows = unwrapList(
        await supabase
          .from('messages')
          .select('client_id, text, sent_at, sender')
          .order('sent_at', { ascending: false }),
      );
      const seen = new Set<string>();
      const threads: CoachThreadSummary[] = [];
      for (const row of rows as { client_id: string; text: string; sent_at: string; sender: string }[]) {
        if (seen.has(row.client_id)) continue;
        seen.add(row.client_id);
        threads.push({
          clientId: row.client_id,
          lastText: row.text,
          lastAt: row.sent_at,
          lastSender: row.sender as MessageSender,
        });
      }
      return threads;
    },
  };
}
