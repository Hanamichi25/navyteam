import { Stack } from 'expo-router';

/** Stack de la sección Usuarios: lista → perfil de cliente. */
export default function ClientsLayout(): React.JSX.Element {
  return <Stack screenOptions={{ headerShown: false }} />;
}
