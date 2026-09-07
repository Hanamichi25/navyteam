import { createClient, type SupabaseClient } from 'jsr:@supabase/supabase-js@2';

/** Cliente con `service_role` (salta RLS). Las 3 env vars las inyecta la plataforma. */
export function adminClient(): SupabaseClient {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

export interface Caller {
  uid: string;
  role: string | undefined;
}

/** Identifica al usuario que hace la petición a partir de su JWT. `null` si no hay/no vale. */
export async function getCaller(req: Request, admin: SupabaseClient): Promise<Caller | null> {
  const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '');
  if (!token) return null;
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return null;
  return { uid: data.user.id, role: (data.user.user_metadata?.role as string | undefined) };
}

/**
 * `true` si la llamada identificada por `key` está dentro del límite
 * (`max` por ventana de `windowSeconds`). Si la comprobación falla por un
 * problema de infra, deja pasar (fail-open) — no queremos que un fallo del
 * rate limiter tumbe la función legítima.
 */
export async function withinRateLimit(
  admin: SupabaseClient,
  key: string,
  max: number,
  windowSeconds: number,
): Promise<boolean> {
  const { data, error } = await admin.rpc('check_rate_limit', {
    p_key: key,
    p_max: max,
    p_window_seconds: windowSeconds,
  });
  if (error) return true;
  return data === true;
}
