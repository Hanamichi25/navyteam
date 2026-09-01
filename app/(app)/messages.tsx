import { useNavigation } from 'expo-router';

import { ComingSoon } from '@/components/ComingSoon';
import { openDrawer } from '@/lib/openDrawer';

export default function MessagesScreen(): React.JSX.Element {
  const navigation = useNavigation();
  return <ComingSoon title="Mensajes" onMenu={() => openDrawer(navigation)} />;
}
