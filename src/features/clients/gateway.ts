import type { Client, ClientDetail, ClientInput } from '@/types/client';
import type { Routine } from '@/types/routine';

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
}
