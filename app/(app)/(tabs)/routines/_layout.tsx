import { Stack } from 'expo-router';

/** Stack de la sección Rutinas: catálogo → nueva (modal) / editar. */
export default function RoutinesLayout(): React.JSX.Element {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="new" options={{ presentation: 'modal' }} />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
