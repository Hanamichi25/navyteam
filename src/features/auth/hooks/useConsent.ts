import { PRIVACY_POLICY_VERSION } from '../policy';
import { useAuthStore } from '../store/authStore';

interface ConsentGate {
  /** `true` mientras aún no se sabe si el usuario aceptó la política (arranque / login). */
  loading: boolean;
  /** `true` si hay usuario y falta aceptar la versión vigente de la política. */
  needsConsent: boolean;
  /** Fecha ISO en que se aceptó la versión vigente, o `null`. */
  acceptedAt: string | null;
}

/**
 * Estado del gate de consentimiento. Los guards de navegación redirigen a
 * `/privacy-consent` cuando `needsConsent` es `true`.
 */
export function useConsent(): ConsentGate {
  const user = useAuthStore((s) => s.user);
  const consent = useAuthStore((s) => s.consent);
  const consentReady = useAuthStore((s) => s.consentReady);

  if (!user) {
    return { loading: false, needsConsent: false, acceptedAt: null };
  }
  if (!consentReady) {
    return { loading: true, needsConsent: false, acceptedAt: null };
  }
  const accepted = consent?.policyVersion === PRIVACY_POLICY_VERSION;
  return {
    loading: false,
    needsConsent: !accepted,
    acceptedAt: accepted ? consent!.acceptedAt : null,
  };
}
