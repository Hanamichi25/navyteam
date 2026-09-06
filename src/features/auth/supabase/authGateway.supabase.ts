import type { Session as SupabaseSession, User as SupabaseUser } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import type {
  Consent,
  ConsentRecord,
  LoginCredentials,
  LoginResult,
  Session,
  User,
  UserRole,
} from '@/types/auth';
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

    async getConsent(): Promise<Consent | null> {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) return null;

      const { data, error } = await supabase
        .from('user_consents')
        .select('policy_version, accepted_at')
        .eq('user_id', uid)
        .maybeSingle();
      if (error || !data) return null;
      return { policyVersion: data.policy_version, acceptedAt: data.accepted_at };
    },

    async acceptConsent(policyVersion: string): Promise<void> {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) throw new Error('No hay sesión para registrar el consentimiento.');

      const { error } = await supabase
        .from('user_consents')
        .upsert(
          { user_id: uid, policy_version: policyVersion, accepted_at: new Date().toISOString() },
          { onConflict: 'user_id' },
        );
      if (error) throw new Error(error.message);
    },

    async getConsentReport(): Promise<ConsentRecord[]> {
      const { data, error } = await supabase.rpc('consent_report');
      if (error) throw new Error(error.message);
      return (data ?? []).map(
        (row: {
          user_id: string;
          email: string;
          name: string;
          role: string;
          policy_version: string;
          accepted_at: string;
        }) => ({
          userId: row.user_id,
          email: row.email,
          name: row.name,
          role: row.role,
          policyVersion: row.policy_version,
          acceptedAt: row.accepted_at,
        }),
      );
    },
  };
}
