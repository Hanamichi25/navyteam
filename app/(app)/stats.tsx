import { useNavigation } from 'expo-router';

import { ComingSoon } from '@/components/ComingSoon';
import { openDrawer } from '@/lib/openDrawer';

export default function StatsScreen(): React.JSX.Element {
  const navigation = useNavigation();
  return <ComingSoon title="Estadísticas" onMenu={() => openDrawer(navigation)} />;
}
