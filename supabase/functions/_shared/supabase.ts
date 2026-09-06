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
