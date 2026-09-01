import { useNavigation } from 'expo-router';

import { ComingSoon } from '@/components/ComingSoon';
import { openDrawer } from '@/lib/openDrawer';

export default function SupportScreen(): React.JSX.Element {
  const navigation = useNavigation();
  return (
    <ComingSoon title="Ayuda y Soporte" onMenu={() => openDrawer(navigation)} />
  );
}
