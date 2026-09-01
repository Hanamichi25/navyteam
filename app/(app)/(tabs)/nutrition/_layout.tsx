import { Stack } from 'expo-router';

/** Stack de la sección Alimentación: lista → nuevo plan (modal). */
export default function NutritionLayout(): React.JSX.Element {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="new" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
