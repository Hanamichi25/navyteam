/** Pausa artificial para que los mocks simulen latencia de red. */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
