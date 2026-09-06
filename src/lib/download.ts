import { Platform, Share } from 'react-native';

/**
 * Entrega un archivo de texto al usuario.
 * - Web: descarga vía Blob + `<a download>`.
 * - Nativo: comparte el contenido con la hoja de compartir del SO (no hay
 *   `expo-file-system`/`expo-sharing` instalados todavía).
 */
export async function saveTextFile(
  filename: string,
  content: string,
  mimeType = 'text/plain;charset=utf-8',
): Promise<void> {
  if (Platform.OS === 'web') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return;
  }
  await Share.share({ title: filename, message: content });
}
