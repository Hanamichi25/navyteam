import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { adminClient, getCaller, withinRateLimit } from '../_shared/supabase.ts';

/**
 * Invita por email a un cliente a que cree su cuenta y ponga contraseña.
 *
 * POST { clientId }  (Authorization: Bearer <JWT del coach>)
 *
 * - Verifica que el llamante es un coach dueño de la ficha.
 * - Lee email/nombre de la fila `clients` (no se confía en el body).
 * - `inviteUserByEmail` con metadata { role: 'client', name, client_id }.
 * - Reenvío: si ya había un usuario sin confirmar, se borra y se re-invita.
 * - Guarda `clients.client_user_id`.
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const admin = adminClient();
    const caller = await getCaller(req, admin);
    if (!caller || caller.role !== 'coach') {
      return jsonResponse({ error: 'No autorizado.' }, 403);
    }

    // Máx. 10 invitaciones por coach cada 10 min (cada una manda un email).
    if (!(await withinRateLimit(admin, `invite:${caller.uid}`, 10, 600))) {
      return jsonResponse(
        { error: 'Demasiadas invitaciones seguidas. Espera unos minutos e inténtalo de nuevo.' },
        429,
      );
    }

    const { clientId } = await req.json().catch(() => ({}));
    if (!clientId) return jsonResponse({ error: 'Falta clientId.' }, 400);

    const { data: client, error: cErr } = await admin
      .from('clients')
      .select('id, coach_id, email, name, client_user_id')
      .eq('id', clientId)
      .single();
    if (cErr || !client) return jsonResponse({ error: 'Ficha no encontrada.' }, 404);
    if (client.coach_id !== caller.uid) return jsonResponse({ error: 'No autorizado.' }, 403);
    if (!client.email) {
      return jsonResponse({ error: 'La ficha no tiene email. Añádelo para poder invitar.' }, 400);
    }

    // ¿Ya vinculado? Si está confirmado, no se reinvita; si no, se limpia y se reinvita.
    if (client.client_user_id) {
      const { data: existing } = await admin.auth.admin.getUserById(client.client_user_id);
      if (existing?.user?.email_confirmed_at) {
        return jsonResponse({ error: 'Este cliente ya tiene acceso activo.' }, 409);
      }
      await admin.auth.admin.deleteUser(client.client_user_id);
      await admin.from('clients').update({ client_user_id: null }).eq('id', clientId);
    }

    const { data, error } = await admin.auth.admin.inviteUserByEmail(client.email, {
      data: { role: 'client', name: client.name, client_id: clientId },
      redirectTo: Deno.env.get('INVITE_REDIRECT_URL'),
    });
    if (error || !data.user) {
      return jsonResponse(
        { error: `No se pudo enviar la invitación: ${error?.message ?? 'error desconocido'}` },
        409,
      );
    }

    await admin.from('clients').update({ client_user_id: data.user.id }).eq('id', clientId);
    return jsonResponse({ ok: true });
  } catch (e) {
    return jsonResponse({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
