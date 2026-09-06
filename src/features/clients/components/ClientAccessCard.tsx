import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { COLORS } from '@/lib/colors';
import { useClientAccess, useInviteClient } from '../hooks/useClients';

interface ClientAccessCardProps {
  clientId: string;
  /** La ficha tiene email (condición para poder invitar). */
  hasEmail: boolean;
}

/**
 * Estado de acceso del cliente a la app + acciones de invitación.
 * El borrado de acceso se hace eliminando la ficha (perfil → editar → eliminar).
 */
export function ClientAccessCard({ clientId, hasEmail }: ClientAccessCardProps): React.JSX.Element {
  const access = useClientAccess(clientId);
  const invite = useInviteClient();
  const [feedback, setFeedback] = useState<string | null>(null);

  const sendInvite = async (): Promise<void> => {
    setFeedback(null);
    try {
      await invite.mutateAsync(clientId);
      setFeedback('Invitación enviada. El cliente recibirá un email para crear su contraseña.');
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'No se pudo enviar la invitación.');
    }
  };

  if (access.status === 'loading') {
    return <Text className="text-sm text-ink-faint">Comprobando acceso…</Text>;
  }

  const status = access.status === 'ready' ? access.data : 'none';

  return (
    <View className="gap-3">
      {status === 'active' ? (
        <View className="flex-row items-center gap-2">
          <Ionicons name="checkmark-circle" size={18} color="#047857" />
          <Text className="text-sm font-semibold text-emerald-700">Tiene acceso a la app</Text>
        </View>
      ) : status === 'invited' ? (
        <>
          <View className="flex-row items-center gap-2">
            <Ionicons name="mail-unread-outline" size={18} color={COLORS.primary} />
            <Text className="text-sm font-semibold text-ink">
              Invitación enviada · sin activar
            </Text>
          </View>
          <Text className="text-sm text-ink-muted">
            El cliente todavía no ha creado su contraseña.
          </Text>
          <Button
            label="Reenviar invitación"
            variant="outline"
            fullWidth
            loading={invite.isPending}
            onPress={sendInvite}
          />
        </>
      ) : hasEmail ? (
        <>
          <Text className="text-sm text-ink-muted">
            Este usuario aún no tiene acceso a la app.
          </Text>
          <Button
            label="Invitar por email"
            fullWidth
            loading={invite.isPending}
            onPress={sendInvite}
          />
        </>
      ) : (
        <Text className="text-sm text-ink-muted">
          Añade un email en el perfil para poder invitar a este usuario.
        </Text>
      )}

      {feedback ? <Text className="text-xs text-ink-faint">{feedback}</Text> : null}
      {access.status === 'error' ? (
        <Text className="text-xs text-ink-faint">{access.error}</Text>
      ) : null}
    </View>
  );
}
