import { supabase } from '@/lib/supabase';
import { unwrapList } from '@/lib/supabaseQuery';
import type { AppNotification, NotificationKind } from '@/types/notification';
import type { NotificationsGateway } from '../gateway';

interface NotificationRow {
  id: string;
  kind: string;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
}

function rowToDomain(row: NotificationRow): AppNotification {
  return {
    id: row.id,
    kind: row.kind as NotificationKind,
    title: row.title,
    body: row.body,
    data: row.data ?? {},
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}

async function currentUid(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  const uid = data.user?.id;
  if (!uid) throw new Error('No hay sesión.');
  return uid;
}

export function createSupabaseNotificationsGateway(): NotificationsGateway {
  return {
    async list(): Promise<AppNotification[]> {
      const rows = unwrapList(
        await supabase
          .from('notifications')
          .select('id, kind, title, body, data, read_at, created_at')
          .order('created_at', { ascending: false })
          .limit(100),
      ) as NotificationRow[];
      return rows.map(rowToDomain);
    },

    async markRead(id: string): Promise<void> {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', id)
        .is('read_at', null);
      if (error) throw new Error(error.message);
    },

    async markAllRead(): Promise<void> {
      const uid = await currentUid();
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', uid)
        .is('read_at', null);
      if (error) throw new Error(error.message);
    },

    async remove(id: string): Promise<void> {
      const { error } = await supabase.from('notifications').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },

    async registerToken(token: string, platform: string): Promise<void> {
      const uid = await currentUid();
      const { error } = await supabase.from('push_tokens').upsert(
        { token, user_id: uid, platform, updated_at: new Date().toISOString() },
        { onConflict: 'token' },
      );
      if (error) throw new Error(error.message);
    },

    async unregisterToken(token: string): Promise<void> {
      const { error } = await supabase.from('push_tokens').delete().eq('token', token);
      if (error) throw new Error(error.message);
    },

    subscribe(onChange: () => void): () => void {
      const channel = supabase
        .channel('notifications-inbox')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications' },
          () => onChange(),
        )
        .subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    },
  };
}
