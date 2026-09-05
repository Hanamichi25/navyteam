import type { Session as SupabaseSession, User as SupabaseUser } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import type { LoginCredentials, LoginResult, Session, User, UserRole } from '@/types/auth';
import type { AuthGateway } from '../gateway';

/**
 * Implementación real de `AuthGateway` sobre Supabase Auth.
 *
 * Rol y `clientId` viven en `user_metadata` (editable solo por el entrenador
 * desde el panel de Supabase o, en Fase 10, desde un flujo de alta de
 * clientes que use la service role key en servidor — nunca desde el cliente).
 */

function toDomainUser(supabaseUser: SupabaseUser): User {
  const metadata = supabaseUser.user_metadata as Record<string, unknown>;
  const role = metadata.role as UserRole | undefined;

  if (role !== 'coach' && role !== 'client') {
    throw new Error(
      `El usuario ${supabaseUser.email ?? supabaseUser.id} no tiene un rol válido configurado (user_metadata.role).`,
    );
  }

  return {
    id: supabaseUser.id,
    name: (metadata.name as string | undefined) ?? supabaseUser.email ?? 'Usuario',
    email: supabaseUser.email ?? '',
    avatarUrl: (metadata.avatar_url as string | undefined) ?? '',
    role,
    clientId: (metadata.client_id as string | undefined) ?? undefined,
  };
}

function toDomainSession(session: SupabaseSession): Session {
  return {
    user: toDomainUser(session.user),
    expiresAt: (session.expires_at ?? 0) * 1000,
  };
}

export function createSupabaseAuthGateway(): AuthGateway {
  return {
    async signIn({ email, password }: LoginCredentials): Promise<LoginResult> {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error || !data.user) {
        return { error: 'Correo o contraseña incorrectos' };
      }

      try {
        return { user: toDomainUser(data.user) };
      } catch (err) {
        await supabase.auth.signOut();
        return { error: err instanceof Error ? err.message : 'No se pudo iniciar sesión' };
      }
    },

    async signOut(): Promise<void> {
      await supabase.auth.signOut();
    },

    async getSession(): Promise<Session | null> {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) return null;

      try {
        return toDomainSession(data.session);
      } catch {
        return null;
      }
    },

    async refresh(): Promise<Session | null> {
      const { data, error } = await supabase.auth.refreshSession();
      if (error || !data.session) return null;

      try {
        return toDomainSession(data.session);
      } catch {
        return null;
      }
    },
  };
}
