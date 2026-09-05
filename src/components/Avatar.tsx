import { Image, View } from 'react-native';

interface AvatarProps {
  /** URL de la imagen; si falta, se muestra el fondo del avatar. */
  uri: string | undefined;
  /** Lado del avatar en px. */
  size?: number;
  /** Anillo llamativo (perfil, cabeceras hero). Por defecto un borde sutil. */
  ring?: boolean;
  /** Clases extra desde el consumidor. */
  className?: string;
}

/** Imagen de perfil circular. En pantallas de detalle, `ring` le da un anillo dorado. */
export function Avatar({
  uri,
  size = 40,
  ring = false,
  className = '',
}: AvatarProps): React.JSX.Element {
  const ringWidth = ring ? Math.max(3, Math.round(size * 0.045)) : 1;

  return (
    <View
      className={`items-center justify-center overflow-hidden rounded-full ${ring ? 'bg-gold' : 'border border-line bg-surface-field'} ${className}`}
      style={{ width: size, height: size, padding: ring ? ringWidth : 0 }}
    >
      <View className="overflow-hidden rounded-full bg-surface-field" style={{ width: '100%', height: '100%' }}>
        <Image source={{ uri }} style={{ width: '100%', height: '100%' }} />
      </View>
    </View>
  );
}
