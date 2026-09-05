import { Ionicons } from '@expo/vector-icons';
import { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import { FeedbackState } from '@/components/FeedbackState';
import { COLORS } from '@/lib/colors';
import type { Message, MessageSender } from '@/types/message';

import { useSendMessage, useThread } from '../hooks/useMessages';

interface MessageThreadProps {
  clientId: string;
  /** Quién está mirando el hilo: sus mensajes van a la derecha. */
  viewerRole: MessageSender;
  /** Texto del estado vacío (varía coach/cliente). */
  emptyHint?: string;
}

const DATE_FMT = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long' });
const TIME_FMT = new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' });

/** Etiqueta de día para el separador (Hoy / Ayer / "3 de septiembre"). */
function dayLabel(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const startOf = (d: Date): number =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOf(today) - startOf(date)) / 86_400_000);
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  return DATE_FMT.format(date);
}

interface Row {
  message: Message;
  showDay: boolean;
}

function toRows(messages: Message[]): Row[] {
  return messages.map((message, index) => {
    const prev = messages[index - 1];
    const showDay = !prev || dayLabel(prev.sentAt) !== dayLabel(message.sentAt);
    return { message, showDay };
  });
}

/**
 * Hilo de conversación entre entrenador y cliente. Lo usan la pestaña
 * "Mensajes" del perfil del cliente (entrenador) y la pantalla "Tu entrenador"
 * (cliente) — solo cambia `viewerRole`.
 */
export function MessageThread({
  clientId,
  viewerRole,
  emptyHint = 'Todavía no hay mensajes. Escribe el primero.',
}: MessageThreadProps): React.JSX.Element {
  const thread = useThread(clientId);
  const sendMessage = useSendMessage();
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList<Row>>(null);

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  }, []);

  const submit = async (): Promise<void> => {
    const text = draft.trim();
    if (!text || sendMessage.isPending) return;
    setDraft('');
    await sendMessage.mutateAsync({ clientId, sender: viewerRole, text });
    scrollToEnd();
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {thread.status === 'loading' ? (
        <FeedbackState variant="loading" />
      ) : thread.status === 'error' ? (
        <FeedbackState variant="error" message={thread.error} />
      ) : (
        <FlatList
          ref={listRef}
          data={toRows(thread.data)}
          keyExtractor={(row) => row.message.id}
          contentContainerClassName="gap-2 px-5 py-4"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToEnd}
          ListEmptyComponent={
            <Text className="px-1 pt-6 text-center text-sm text-ink-muted">
              {emptyHint}
            </Text>
          }
          renderItem={({ item }) => {
            const mine = item.message.sender === viewerRole;
            return (
              <View className="gap-2">
                {item.showDay ? (
                  <Text className="self-center text-xs font-semibold text-ink-faint">
                    {dayLabel(item.message.sentAt)}
                  </Text>
                ) : null}
                <View
                  style={{ maxWidth: '82%' }}
                  className={`gap-1 rounded-2xl px-3.5 py-2.5 ${
                    mine
                      ? 'self-end bg-primary'
                      : 'self-start border border-line bg-surface-field'
                  }`}
                >
                  <Text
                    className={`text-sm leading-5 ${mine ? 'text-white' : 'text-ink'}`}
                  >
                    {item.message.text}
                  </Text>
                  <Text
                    className={`text-xs ${mine ? 'text-primary-light' : 'text-ink-faint'}`}
                  >
                    {TIME_FMT.format(new Date(item.message.sentAt))}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}

      <View className="flex-row items-end gap-2 border-t border-line px-4 py-2.5">
        <TextInput
          className="max-h-28 flex-1 rounded-2xl border border-line bg-surface-field px-3.5 py-2.5 text-base text-ink"
          placeholder="Escribe un mensaje…"
          placeholderTextColor={COLORS.inkFaint}
          value={draft}
          onChangeText={setDraft}
          multiline
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Enviar mensaje"
          disabled={draft.trim() === '' || sendMessage.isPending}
          onPress={submit}
          className={`h-11 w-11 items-center justify-center rounded-full ${
            draft.trim() === '' ? 'bg-primary-light' : 'bg-primary active:bg-primary-dark'
          }`}
        >
          <Ionicons
            name="send"
            size={18}
            color={draft.trim() === '' ? COLORS.primary : '#FFFFFF'}
          />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
