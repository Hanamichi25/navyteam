import type { CoachThreadSummary, Message, MessageInput } from '@/types/message';

/**
 * Interfaz de infraestructura que necesita el módulo "mensajería".
 * TODO(backend): la implementación real (Fase 10) habla contra la API/BD y
 * hace que el intercambio funcione entre dispositivos.
 */
export interface MessagesGateway {
  /** Mensajes del hilo de un cliente, en orden ascendente por fecha. */
  listByClient(clientId: string): Promise<Message[]>;
  send(input: MessageInput): Promise<Message>;
  /** Un resumen por cliente con hilo, más reciente primero (lista del entrenador). */
  coachThreads(): Promise<CoachThreadSummary[]>;
}
