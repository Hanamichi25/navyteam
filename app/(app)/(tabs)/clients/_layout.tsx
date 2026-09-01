import { Stack } from 'expo-router';

/** Stack de la sección Usuarios: lista → perfil de cliente → asignar rutina (modal). */
export default function ClientsLayout(): React.JSX.Element {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]/index" />
      <Stack.Screen name="[id]/assign-routine" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
