import { ScrollView, Text, View } from 'react-native';

import {
  PRIVACY_POLICY,
  PRIVACY_POLICY_TITLE,
  PRIVACY_POLICY_UPDATED,
} from '../policy';

/**
 * Cuerpo scrolleable de la Política de Tratamiento de Datos. Sin cabecera ni
 * botones: lo envuelven `app/privacy.tsx` (solo lectura) y
 * `app/privacy-consent.tsx` (gate de aceptación).
 */
export function PrivacyPolicyView(): React.JSX.Element {
  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="px-5 pb-8 pt-2 gap-5"
      showsVerticalScrollIndicator={false}
    >
      <View className="gap-1">
        <Text className="text-xl font-extrabold text-ink">{PRIVACY_POLICY_TITLE}</Text>
        <Text className="text-xs text-ink-faint">
          Última actualización: {PRIVACY_POLICY_UPDATED}
        </Text>
      </View>

      {PRIVACY_POLICY.map((section) => (
        <View key={section.heading} className="gap-1.5">
          <Text className="text-sm font-bold text-ink">{section.heading}</Text>
          {section.paragraphs.map((paragraph, i) => (
            <Text key={i} className="text-sm leading-6 text-ink-muted">
              {paragraph}
            </Text>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}
