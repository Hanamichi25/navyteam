import type { Message } from '@/types/message';

/**
 * Datos semilla de la mensajería, usados por `messagesGateway.mock.ts` para
 * sembrar AsyncStorage la primera vez. Solo el cliente demo (`cli_luis`) tiene
 * un hilo de ejemplo.
 *
 * TODO(backend): estos datos desaparecen al conectar el backend real (Fase 10).
 */

/** Días atrás → ISO string (para que las fechas del seed sean relativas a "hoy"). */
function daysAgo(days: number, hour = 9, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const MESSAGES_SEED: readonly Message[] = [
  {
    id: 'msg_luis_1',
    clientId: 'cli_luis',
    sender: 'coach',
    text: '¡Buen trabajo esta semana, Luis! Subiste el press de banca sin perder técnica. Mantén ese ritmo y descansa bien entre series.',
    sentAt: daysAgo(3, 18, 30),
  },
  {
    id: 'msg_luis_2',
    clientId: 'cli_luis',
    sender: 'client',
    text: 'Gracias! Me sentí fuerte. Una duda: ¿el jueves cambio el remo por dominadas?',
    sentAt: daysAgo(3, 20, 5),
  },
  {
    id: 'msg_luis_3',
    clientId: 'cli_luis',
    sender: 'coach',
    text: 'Sí, perfecto. 4 series de dominadas, y si te sobran repes añade lastre poco a poco.',
    sentAt: daysAgo(2, 9, 15),
  },
];
