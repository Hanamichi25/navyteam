import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Platform, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAuthStore } from '@/features/auth';
import { supabase } from '@/lib/supabase';

const schema = z
  .object({
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    path: ['confirm'],
    message: 'Las contraseñas no coinciden',
  });

type FormValues = z.infer<typeof schema>;

type Phase = 'verifying' | 'ready' | 'invalid' | 'saving' | 'done';

/**
 * Destino del enlace de invitación por email. Establece la sesión a partir del
 * token del enlace y deja al cliente elegir su contraseña. Luego cae en el
 * gate de consentimiento y en su vista.
 */
export default function SetPasswordScreen(): React.JSX.Element {
  const router = useRouter();
  const restore = useAuthStore((s) => s.restore);
  const [phase, setPhase] = useState<Phase>('verifying');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirm: '' },
    mode: 'onTouched',
  });

  useEffect(() => {
    let cancelled = false;
    async function establishSession(): Promise<void> {
      if (Platform.OS !== 'web') {
        setPhase('invalid');
        setErrorMsg('Abre el enlace de invitación desde un navegador.');
        return;
      }
      try {
        const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        const query = new URLSearchParams(window.location.search);
        const accessToken = hash.get('access_token');
        const refreshToken = hash.get('refresh_token');
        const code = query.get('code');

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
        } else if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else {
          const { data } = await supabase.auth.getSession();
          if (!data.session) throw new Error('sin token');
        }
        if (!cancelled) setPhase('ready');
      } catch {
        if (!cancelled) {
          setPhase('invalid');
          setErrorMsg('El enlace no es válido o ya expiró. Pide a tu entrenador que te reenvíe la invitación.');
        }
      }
    }
    void establishSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    setPhase('saving');
    setErrorMsg(null);
    const { error } = await supabase.auth.updateUser({ password: values.password });
    if (error) {
      setPhase('ready');
      setErrorMsg(error.message);
      return;
    }
    await restore();
    setPhase('done');
    router.replace('/');
  });

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <ScreenHeader title="Crea tu contraseña" centered />

      <View className="flex-1 px-6 pt-4">
        {phase === 'verifying' ? (
          <Text className="text-base text-ink-muted">Verificando el enlace…</Text>
        ) : phase === 'invalid' ? (
          <View className="gap-4">
            <Text className="text-base text-ink">{errorMsg}</Text>
            <Button
              label="Ir a iniciar sesión"
              variant="outline"
              fullWidth
              onPress={() => router.replace('/(auth)/login')}
            />
          </View>
        ) : (
          <View className="gap-5">
            <Text className="text-sm text-ink-muted">
              Elige una contraseña para acceder a NavyTeam.
            </Text>

            <Controller
              control={control}
              name="password"
              render={({ field: { value, onChange, onBlur }, fieldState }) => (
                <Input
                  label="Contraseña"
                  iconName="lock-closed-outline"
                  placeholder="Mínimo 8 caracteres"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={fieldState.error?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="confirm"
              render={({ field: { value, onChange, onBlur }, fieldState }) => (
                <Input
                  label="Repite la contraseña"
                  iconName="lock-closed-outline"
                  placeholder="Vuelve a escribirla"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={fieldState.error?.message}
                />
              )}
            />

            {errorMsg ? <Text className="text-sm text-rose-600">{errorMsg}</Text> : null}

            <Button
              label="Guardar y entrar"
              fullWidth
              loading={phase === 'saving' || phase === 'done'}
              onPress={onSubmit}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
