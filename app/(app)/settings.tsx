import { useNavigation } from 'expo-router';

import { ComingSoon } from '@/components/ComingSoon';
import { openDrawer } from '@/lib/openDrawer';

export default function SettingsScreen(): React.JSX.Element {
  const navigation = useNavigation();
  return <ComingSoon title="Configuración" onMenu={() => openDrawer(navigation)} />;
}
