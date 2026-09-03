import { Stack } from 'expo-router';

/** Stack de "Mis entrenos": historial → iniciar / registrar sesión (modales) / detalle. */
export default function ClientWorkoutsLayout(): React.JSX.Element {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="start"
        options={{ presentation: 'modal', gestureEnabled: false }}
      />
      <Stack.Screen name="log" options={{ presentation: 'modal' }} />
      <Stack.Screen name="[sessionId]" />
      <Stack.Screen name="progress/[exerciseId]" />
    </Stack>
  );
}
