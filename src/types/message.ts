/**
 * Tipos del dominio "mensajería" entre entrenador y cliente.
 *
 * Cada cliente tiene un único hilo con su entrenador. La forma anticipa un
 * endpoint tipo `GET /clients/:id/messages` + `POST /clients/:id/messages`.
 * TODO(backend): con AsyncStorage el hilo es local al dispositivo; el
 * intercambio real entre dispositivos llega en la Fase 10.
 */

/** Quién envió el mensaje. */
export type MessageSender = 'coach' | 'client';

/** Un mensaje dentro del hilo de un cliente. */
export interface Message {
  id: string;
  clientId: string;
  sender: MessageSender;
  text: string;
  /** Marca de tiempo ISO 8601. */
  sentAt: string;
}

/** Campos que llegan al `send()` de un mensaje. */
export interface MessageInput {
  clientId: string;
  sender: MessageSender;
  text: string;
}

/**
 * Resumen del hilo de un cliente para la lista de "Mensajes" del entrenador.
 * El nombre y el avatar los añade la pantalla cruzando con `useClients()` — el
 * Gateway de mensajería no conoce el dominio de clientes.
 */
export interface CoachThreadSummary {
  clientId: string;
  /** Texto del último mensaje del hilo. */
  lastText: string;
  /** Marca de tiempo ISO del último mensaje. */
  lastAt: string;
  lastSender: MessageSender;
}
