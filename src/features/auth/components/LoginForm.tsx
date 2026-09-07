import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useAuthStore } from '@/features/auth/store/authStore';
import { loginSchema, type LoginFormValues } from '@/features/auth/validation';

/** Intentos fallidos antes de empezar a frenar, y el freno en segundos por intento extra. */
const FREE_ATTEMPTS = 5;
const LOCKOUT_STEP_SEC = 15;
const LOCKOUT_MAX_SEC = 120;

export function LoginForm(): React.JSX.Element {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const clearError = useAuthStore((state) => state.clearError);
  const serverError = useAuthStore((state) => state.error);
  const status = useAuthStore((state) => state.status);
  const isLoading = status === 'loading';

  // Back-off local: freno creciente tras varios fallos seguidos. Es UX
  // defensiva (evita el machaque del botón); la autoridad real es el rate
  // limiting de Supabase Auth sobre /token.
  const failuresRef = useRef(0);
  const [lockUntil, setLockUntil] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const lockRemainingSec = Math.max(0, Math.ceil((lockUntil - now) / 1000));
  const locked = lockRemainingSec > 0;

  useEffect(() => {
    if (!locked) return;
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [locked]);

  const { control, handleSubmit, formState } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
  });

  const onSubmit = handleSubmit(async (values) => {
    if (locked) return;
    const ok = await login(values);
    if (ok) {
      failuresRef.current = 0;
      // `index` decide: gate de consentimiento primero, luego el área según el rol.
      router.replace('/');
      return;
    }
    failuresRef.current += 1;
    const over = failuresRef.current - FREE_ATTEMPTS;
    if (over > 0) {
      setLockUntil(Date.now() + Math.min(over * LOCKOUT_STEP_SEC, LOCKOUT_MAX_SEC) * 1000);
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

      {locked ? (
        <View className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <Text className="text-sm text-amber-700">
            Demasiados intentos. Espera {lockRemainingSec} s antes de volver a probar.
          </Text>
        </View>
      ) : null}

      <Button
        label={locked ? `Espera ${lockRemainingSec} s` : 'Iniciar Sesión'}
        onPress={onSubmit}
        loading={isLoading}
        disabled={formState.isSubmitting || locked}
        fullWidth
      />
    </View>
  );
}
