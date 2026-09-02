import { Stack } from 'expo-router';

/** Stack de "Mis entrenos": historial → registrar sesión (modal) / detalle. */
export default function ClientWorkoutsLayout(): React.JSX.Element {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="log" options={{ presentation: 'modal' }} />
      <Stack.Screen name="[sessionId]" />
    </Stack>
  );
}
