import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useAuthStore } from '@/features/auth/store/authStore';
import { loginSchema, type LoginFormValues } from '@/features/auth/validation';

export function LoginForm(): React.JSX.Element {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const clearError = useAuthStore((state) => state.clearError);
  const serverError = useAuthStore((state) => state.error);
  const status = useAuthStore((state) => state.status);
  const isLoading = status === 'loading';

  const { control, handleSubmit, formState } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
  });

  const onSubmit = handleSubmit(async (values) => {
    const ok = await login(values);
    if (ok) {
      const role = useAuthStore.getState().user?.role;
      router.replace(
        role === 'client' ? '/(client)/routine' : '/(app)/(tabs)/dashboard',
      );
    }
  });

  return (
    <View className="gap-5">
      <Controller
        control={control}
        name="email"
        render={({ field: { value, onChange, onBlur }, fieldState }) => (
          <Input
            label="Correo electrónico"
            iconName="mail-outline"
            placeholder="entrenador@fitcoach.com"
            keyboardType="email-address"
            autoComplete="email"
            editable={!isLoading}
            value={value}
            onChangeText={(text) => {
              if (serverError) clearError();
              onChange(text);
            }}
            onBlur={onBlur}
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { value, onChange, onBlur }, fieldState }) => (
          <Input
            label="Contraseña"
            iconName="lock-closed-outline"
            placeholder="Tu contraseña"
            secureTextEntry
            autoComplete="password"
            editable={!isLoading}
            value={value}
            onChangeText={(text) => {
              if (serverError) clearError();
              onChange(text);
            }}
            onBlur={onBlur}
            error={fieldState.error?.message}
          />
        )}
      />

      <Pressable
        className="self-end"
        hitSlop={8}
        onPress={() => {
          // TODO(backend): navegar a recuperación de contraseña (fase posterior).
        }}
      >
        <Text className="text-sm font-semibold text-primary">
          ¿Olvidé mi contraseña?
        </Text>
      </Pressable>

      {serverError ? (
        <View className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
          <Text className="text-sm text-red-600">{serverError}</Text>
        </View>
      ) : null}

      <Button
        label="Iniciar Sesión"
        onPress={onSubmit}
        loading={isLoading}
        disabled={formState.isSubmitting}
        fullWidth
      />
    </View>
  );
}
