import type { BodyMeasurement, Client, ClientDetail, ClientInput } from '@/types/client';
import type { NutritionPlan } from '@/types/nutrition';
import type { Routine } from '@/types/routine';

/** Campos que llegan al `registerPayment()` de un cliente. */
export interface PaymentInput {
  /** Fecha del pago, `dd/mm/aaaa`. */
  date: string;
  amountEur: number;
  /** Meses de suscripción que cubre. */
  months: number;
}

/**
 * Estado del alta por invitación de un cliente:
 * - `none`: la ficha no tiene cuenta de acceso.
 * - `invited`: se envió la invitación pero el cliente aún no puso contraseña.
 * - `active`: el cliente ya tiene acceso a la app.
 */
export type ClientAccess = 'none' | 'invited' | 'active';

/**
 * Interfaz de infraestructura que necesita el módulo "clientes".
 * TODO(backend): la implementación real (Fase 9) habla contra la API/BD.
 */
export interface ClientsGateway {
  list(): Promise<Client[]>;
  get(id: string): Promise<ClientDetail>;
  create(input: ClientInput): Promise<ClientDetail>;
  update(id: string, input: Partial<ClientInput>): Promise<ClientDetail>;
  remove(id: string): Promise<void>;
  /**
   * Asigna una rutina al cliente con el horario indicado. Recibe la
   * `Routine` completa (ya en memoria en la UI vía `useRoutines()`) para no
   * acoplar este Gateway al de rutinas.
   */
  assignRoutine(clientId: string, routine: Routine, schedule: string): Promise<ClientDetail>;
  unassignRoutine(clientId: string, routineId: string): Promise<ClientDetail>;
  /**
   * Asigna un plan de alimentación al cliente, reemplazando el anterior si
   * había uno (un cliente tiene como mucho un plan a la vez).
   */
  assignPlan(clientId: string, plan: NutritionPlan): Promise<ClientDetail>;
  unassignPlan(clientId: string): Promise<ClientDetail>;
  /**
   * Registra un pesaje nuevo. Pasa a ser la medición vigente: recalcula
   * `weightKg`, `weightProgress.currentKg` y `bmi` a partir de ella.
   */
  addMeasurement(clientId: string, input: Omit<BodyMeasurement, 'id'>): Promise<ClientDetail>;
  /**
   * Registra un pago de suscripción: añade el `Payment` y extiende
   * `subscriptionUntil` los `months` indicados (desde hoy o desde la vigencia
   * actual, lo que sea mayor).
   */
  registerPayment(clientId: string, input: PaymentInput): Promise<ClientDetail>;
  /**
   * Envía (o reenvía) al cliente la invitación por email para crear su cuenta.
   * La ficha debe tener email. Requiere backend real (Edge Function).
   */
  invite(clientId: string): Promise<void>;
  /** Estado del alta por invitación del cliente. */
  accessStatus(clientId: string): Promise<ClientAccess>;
}
