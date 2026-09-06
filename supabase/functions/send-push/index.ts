import { adminClient } from '../_shared/supabase.ts';

/**
 * Entrega una notificación por push (Expo Push API).
 *
 * POST { notification_id }   con header  x-push-secret: <PUSH_HOOK_SECRET>
 *
 * La llama la BD vía pg_net desde `public._notify()` justo después de insertar
 * la fila en `notifications`. Se despliega con `--no-verify-jwt` y se protege
 * con el secreto compartido (`app_config.push_secret` == env `PUSH_HOOK_SECRET`).
 *
 * - Carga la notificación y los `push_tokens` del destinatario.
 * - Envía a Expo (`https://exp.host/--/api/v2/push/send`), en lotes de 100.
 * - Borra los tokens que Expo reporta como `DeviceNotRegistered`.
 * - Marca `notifications.pushed_at`.
 */

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface ExpoTicket {
  status: 'ok' | 'error';
  id?: string;
  message?: string;
  details?: { error?: string };
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok');
  if (req.method !== 'POST') return json({ error: 'Método no permitido.' }, 405);

  const secret = Deno.env.get('PUSH_HOOK_SECRET');
  if (!secret || req.headers.get('x-push-secret') !== secret) {
    return json({ error: 'No autorizado.' }, 401);
  }

  const { notification_id } = await req.json().catch(() => ({}));
  if (!notification_id) return json({ error: 'Falta notification_id.' }, 400);

  const admin = adminClient();

  const { data: notif, error: nErr } = await admin
    .from('notifications')
    .select('id, user_id, title, body, data, pushed_at')
    .eq('id', notification_id)
    .single();
  if (nErr || !notif) return json({ error: 'Notificación no encontrada.' }, 404);
  if (notif.pushed_at) return json({ ok: true, skipped: 'ya enviada' });

  const { data: tokenRows } = await admin
    .from('push_tokens')
    .select('token')
    .eq('user_id', notif.user_id);

  const tokens: string[] = (tokenRows ?? []).map((r) => r.token as string);

  if (tokens.length === 0) {
    await admin.from('notifications').update({ pushed_at: new Date().toISOString() }).eq('id', notif.id);
    return json({ ok: true, sent: 0 });
  }

  const basePayload = {
    title: notif.title as string,
    body: notif.body as string,
    data: (notif.data ?? {}) as Record<string, unknown>,
    sound: 'default',
    channelId: 'default',
    priority: 'high',
  };

  const dead: string[] = [];
  let sent = 0;

  for (const group of chunk(tokens, 100)) {
    const messages = group.map((to) => ({ to, ...basePayload }));
    try {
      const res = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
        },
        body: JSON.stringify(messages),
      });
      const payload = (await res.json().catch(() => null)) as { data?: ExpoTicket[] } | null;
      const tickets = payload?.data ?? [];
      tickets.forEach((ticket, i) => {
        if (ticket.status === 'ok') {
          sent += 1;
        } else if (ticket.details?.error === 'DeviceNotRegistered') {
          const token = group[i];
          if (token) dead.push(token);
        }
      });
    } catch (err) {
      console.error('Error enviando a Expo:', err);
    }
  }

  if (dead.length > 0) {
    await admin.from('push_tokens').delete().in('token', dead);
  }
  await admin.from('notifications').update({ pushed_at: new Date().toISOString() }).eq('id', notif.id);

  return json({ ok: true, sent, pruned: dead.length });
});
