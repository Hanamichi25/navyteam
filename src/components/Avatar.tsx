import { Image, View } from 'react-native';

interface AvatarProps {
  uri: string;
  /** Lado del avatar en px. */
  size?: number;
  /** Clases extra desde el consumidor. */
  className?: string;
}

/** Imagen de perfil circular con borde sutil. */
export function Avatar({
  uri,
  size = 40,
  className = '',
}: AvatarProps): React.JSX.Element {
  return (
    <View
      className={`overflow-hidden rounded-full border border-line bg-surface-field ${className}`}
      style={{ width: size, height: size }}
    >
      <Image source={{ uri }} style={{ width: size, height: size }} />
    </View>
  );
}
