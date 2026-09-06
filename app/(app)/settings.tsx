import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { ListRow } from '@/components/ListRow';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAuthStore } from '@/features/auth';
import { COLORS } from '@/lib/colors';
import { confirm } from '@/lib/confirm';
import { toCsv } from '@/lib/csv';
import { saveTextFile } from '@/lib/download';
import { openDrawer } from '@/lib/openDrawer';

export default function SettingsScreen(): React.JSX.Element {
  const navigation = useNavigation();
  const router = useRouter();
  const fetchConsentReport = useAuthStore((s) => s.fetchConsentReport);
  const [downloading, setDownloading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const downloadConsentReport = async (): Promise<void> => {
    setDownloading(true);
    setFeedback(null);
    try {
      const records = await fetchConsentReport();
      if (records.length === 0) {
        setFeedback('Todavía no hay aceptaciones registradas.');
        return;
      }
      const csv = toCsv(
        ['user_id', 'nombre', 'email', 'rol', 'version_politica', 'aceptado_en'],
        records.map((r) => [r.userId, r.name, r.email, r.role, r.policyVersion, r.acceptedAt]),
      );
      const stamp = new Date().toISOString().slice(0, 10);
      await saveTextFile(`consentimientos-navyteam-${stamp}.csv`, csv, 'text/csv;charset=utf-8');
      setFeedback(`Reporte generado: ${records.length} aceptación(es).`);
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'No se pudo generar el reporte.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <ScreenHeader title="Configuración" onMenu={() => openDrawer(navigation)} />

      <ScrollView className="flex-1" contentContainerClassName="gap-6 px-5 py-4">
        <View className="gap-3">
          <Text className="text-xs font-bold uppercase tracking-wide text-ink-faint">
            Privacidad y cumplimiento
          </Text>

          <ListRow
            label="Política de Tratamiento de Datos"
            iconName="document-text-outline"
            onPress={() => router.push('/privacy')}
          />

          <View className="gap-2 rounded-xl border border-line bg-surface-subtle px-4 py-4">
            <View className="flex-row items-center gap-3">
              <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.ink} />
              <Text className="flex-1 text-base font-semibold text-ink">
                Registro de consentimientos
              </Text>
            </View>
            <Text className="text-sm leading-5 text-ink-muted">
              Descarga en CSV quién aceptó la política de datos, con qué versión y en qué fecha.
              Sirve como prueba ante una auditoría o solicitud del titular.
            </Text>
            <Button
              label="Descargar reporte (CSV)"
              variant="outline"
              fullWidth
              loading={downloading}
              onPress={downloadConsentReport}
            />
            {feedback ? (
              <Text className="text-xs text-ink-faint">{feedback}</Text>
            ) : null}
          </View>
        </View>

        <View className="gap-3">
          <Text className="text-xs font-bold uppercase tracking-wide text-ink-faint">Cuenta</Text>
          <ListRow
            label="Cerrar sesión"
            iconName="log-out-outline"
            destructive
            onPress={() =>
              confirm(
                {
                  title: 'Cerrar sesión',
                  message: '¿Seguro que quieres salir?',
                  confirmLabel: 'Cerrar sesión',
                  destructive: true,
                },
                async () => {
                  await useAuthStore.getState().logout();
                  router.replace('/(auth)/login');
                },
              )
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
