import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { adminClient, getCaller } from '../_shared/supabase.ts';

/**
 * Elimina un cliente y TODOS sus datos.
 *
 * POST { clientId }  (Authorization: Bearer <JWT del coach>)
 *
 * 1. `delete from clients` → cascada borra mediciones, rutinas asignadas,
 *    pagos, sesiones (+ logs + series) y mensajes (FKs `on delete cascade`).
 * 2. Si había usuario de Auth vinculado, se borra también (cascada su
 *    `user_consents`).
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const admin = adminClient();
    const caller = await getCaller(req, admin);
    if (!caller || caller.role !== 'coach') {
      return jsonResponse({ error: 'No autorizado.' }, 403);
    }

    const { clientId } = await req.json().catch(() => ({}));
    if (!clientId) return jsonResponse({ error: 'Falta clientId.' }, 400);

    const { data: client } = await admin
      .from('clients')
      .select('id, coach_id, client_user_id')
      .eq('id', clientId)
      .single();

    if (!client) return jsonResponse({ ok: true }); // ya no existe
    if (client.coach_id !== caller.uid) return jsonResponse({ error: 'No autorizado.' }, 403);

    const { error: delErr } = await admin.from('clients').delete().eq('id', clientId);
    if (delErr) return jsonResponse({ error: delErr.message }, 500);

    if (client.client_user_id) {
      await admin.auth.admin.deleteUser(client.client_user_id);
    }
    return jsonResponse({ ok: true });
  } catch (e) {
    return jsonResponse({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
