import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { Badge } from '@/components/Badge';
import type { ClientDetail } from '@/types/client';

import { SUBSCRIPTION_STATUS_META, subscriptionStatus } from '../subscription';

interface SubscriptionCardProps {
  client: ClientDetail;
  /** Abre el formulario "Registrar pago". */
  onRegisterPayment: () => void;
}

/** Card de la suscripción del cliente en su perfil: estado, cuota y pagos. */
export function SubscriptionCard({
  client,
  onRegisterPayment,
}: SubscriptionCardProps): React.JSX.Element {
  const status = subscriptionStatus(client.subscriptionUntil);
  const meta = SUBSCRIPTION_STATUS_META[status];
  const recentPayments = [...client.payments].reverse().slice(0, 3);

  return (
    <View className="gap-3 rounded-2xl border border-line bg-surface-subtle p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-bold text-ink">Suscripción</Text>
        <Badge label={meta.label} tone={meta.tone} />
      </View>

      <View className="flex-row justify-between">
        <View className="gap-0.5">
          <Text className="text-xs text-ink-faint">
            {status === 'expired' ? 'Venció el' : 'Vigente hasta'}
          </Text>
          <Text className="text-sm font-semibold text-ink">
            {client.subscriptionUntil ?? 'Sin pagos registrados'}
          </Text>
        </View>
        <View className="items-end gap-0.5">
          <Text className="text-xs text-ink-faint">Cuota</Text>
          <Text className="text-sm font-semibold text-ink">
            {client.monthlyFeeEur} €/mes
          </Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onRegisterPayment}
        className="flex-row items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 active:bg-primary-dark"
      >
        <Ionicons name="card-outline" size={16} color="#FFFFFF" />
        <Text className="text-sm font-bold text-white">Registrar pago</Text>
      </Pressable>

      {recentPayments.length > 0 ? (
        <View className="gap-1.5 border-t border-line pt-3">
          <Text className="text-xs font-bold uppercase tracking-wide text-ink-faint">
            Últimos pagos
          </Text>
          {recentPayments.map((payment) => (
            <View key={payment.id} className="flex-row items-center justify-between">
              <Text className="text-xs text-ink-muted">
                {payment.date} · {payment.amountEur} €
              </Text>
              <Text className="text-xs text-ink-faint">
                cubre hasta {payment.coversUntil}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
