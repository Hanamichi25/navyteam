import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { COLORS } from '@/lib/colors';

function noop(): void {
  // TODO(backend): implementar OAuth social (Google / Apple) con expo-auth-session.
}

export default function LoginScreen(): React.JSX.Element {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-surface">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerClassName="grow justify-center px-6 py-10"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="mb-8 items-center">
            <View className="mb-5 h-16 w-16 items-center justify-center rounded-full bg-primary-light">
              <Ionicons name="barbell-outline" size={30} color={COLORS.primary} />
            </View>
            <Text className="text-3xl font-extrabold text-ink">NavyTeam</Text>
            <Text className="mt-1 text-base text-ink-muted">
              Tu entrenamiento, bajo control
            </Text>
          </View>

          <LoginForm />

          <View className="my-7 flex-row items-center gap-3">
            <View className="h-px flex-1 bg-line" />
            <Text className="text-xs font-semibold tracking-wider text-ink-faint">
              O CONTINUAR CON
            </Text>
            <View className="h-px flex-1 bg-line" />
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Button
                label="Google"
                variant="outline"
                onPress={noop}
                fullWidth
                icon={<Ionicons name="logo-google" size={18} color="#0F172A" />}
              />
            </View>
            <View className="flex-1">
              <Button
                label="Apple"
                variant="outline"
                onPress={noop}
                fullWidth
                icon={<Ionicons name="logo-apple" size={20} color="#0F172A" />}
              />
            </View>
          </View>

          <View className="mt-8 flex-row justify-center">
            <Text className="text-sm text-ink-muted">¿No tienes cuenta? </Text>
            <Pressable hitSlop={8} onPress={noop}>
              <Text className="text-sm font-bold text-primary">Crear cuenta</Text>
            </Pressable>
          </View>

          <Text className="mt-6 text-center text-xs leading-5 text-ink-faint">
            Al iniciar sesión aceptas nuestra{' '}
            <Text className="font-semibold text-primary" onPress={() => router.push('/privacy')}>
              Política de Tratamiento de Datos
            </Text>
            .
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
