import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useClientsGateway } from '@/gateways';
import { toAsyncState, type AsyncState } from '@/lib/queryState';
import type { BodyMeasurement, Client, ClientDetail, ClientInput } from '@/types/client';
import type { ClientAccess, PaymentInput } from '../gateway';
import type { NutritionPlan } from '@/types/nutrition';
import type { Routine } from '@/types/routine';

const clientsKey = ['clients'] as const;
const clientKey = (id: string) => ['clients', id] as const;
const clientAccessKey = (id: string) => ['clients', id, 'access'] as const;

/** Carga la lista de clientes del entrenador. */
export function useClients(): AsyncState<Client[]> {
  const gateway = useClientsGateway();
  return toAsyncState(
    useQuery({ queryKey: clientsKey, queryFn: gateway.list }),
    'No se pudieron cargar los usuarios',
  );
}

/** Carga el detalle de un cliente por id. */
export function useClient(id: string, enabled = true): AsyncState<ClientDetail> {
  const gateway = useClientsGateway();
  return toAsyncState(
    useQuery({
      queryKey: clientKey(id),
      queryFn: () => gateway.get(id),
      enabled: enabled && id !== '',
    }),
    'No se pudo cargar el perfil del usuario',
  );
}

/** Crea un cliente nuevo e invalida la lista. */
export function useCreateClient() {
  const gateway = useClientsGateway();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ClientInput) => gateway.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientsKey });
    },
  });
}

/** Actualiza un cliente e invalida su detalle y la lista. */
export function useUpdateClient() {
  const gateway = useClientsGateway();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ClientInput> }) =>
      gateway.update(id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: clientsKey });
      queryClient.invalidateQueries({ queryKey: clientKey(variables.id) });
    },
  });
}

/** Elimina un cliente (y su cuenta de acceso + todos sus datos) e invalida la lista. */
export function useRemoveClient() {
  const gateway = useClientsGateway();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => gateway.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientsKey });
    },
  });
}

/** Estado del alta por invitación de un cliente (`none` | `invited` | `active`). */
export function useClientAccess(clientId: string): AsyncState<ClientAccess> {
  const gateway = useClientsGateway();
  return toAsyncState(
    useQuery({
      queryKey: clientAccessKey(clientId),
      queryFn: () => gateway.accessStatus(clientId),
      enabled: clientId !== '',
    }),
    'No se pudo consultar el acceso del usuario',
  );
}

/** Envía (o reenvía) la invitación por email a un cliente. */
export function useInviteClient() {
  const gateway = useClientsGateway();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (clientId: string) => gateway.invite(clientId),
    onSuccess: (_data, clientId) => {
      queryClient.invalidateQueries({ queryKey: clientAccessKey(clientId) });
    },
  });
}

/** Asigna una rutina a un cliente e invalida su detalle. */
export function useAssignRoutineToClient() {
  const gateway = useClientsGateway();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      clientId,
      routine,
      schedule,
    }: {
      clientId: string;
      routine: Routine;
      schedule: string;
    }) => gateway.assignRoutine(clientId, routine, schedule),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: clientKey(variables.clientId) });
      queryClient.invalidateQueries({ queryKey: clientsKey });
    },
  });
}

/** Desasigna una rutina de un cliente e invalida su detalle. */
export function useUnassignRoutineFromClient() {
  const gateway = useClientsGateway();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clientId, routineId }: { clientId: string; routineId: string }) =>
      gateway.unassignRoutine(clientId, routineId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: clientKey(variables.clientId) });
      queryClient.invalidateQueries({ queryKey: clientsKey });
    },
  });
}

/** Asigna un plan de alimentación a un cliente e invalida su detalle. */
export function useAssignPlanToClient() {
  const gateway = useClientsGateway();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clientId, plan }: { clientId: string; plan: NutritionPlan }) =>
      gateway.assignPlan(clientId, plan),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: clientKey(variables.clientId) });
      queryClient.invalidateQueries({ queryKey: clientsKey });
    },
  });
}

/** Desasigna el plan de alimentación de un cliente e invalida su detalle. */
export function useUnassignPlanFromClient() {
  const gateway = useClientsGateway();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (clientId: string) => gateway.unassignPlan(clientId),
    onSuccess: (_data, clientId) => {
      queryClient.invalidateQueries({ queryKey: clientKey(clientId) });
      queryClient.invalidateQueries({ queryKey: clientsKey });
    },
  });
}

/** Registra un pesaje nuevo e invalida el detalle del cliente. */
export function useAddMeasurement() {
  const gateway = useClientsGateway();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      clientId,
      input,
    }: {
      clientId: string;
      input: Omit<BodyMeasurement, 'id'>;
    }) => gateway.addMeasurement(clientId, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: clientKey(variables.clientId) });
      queryClient.invalidateQueries({ queryKey: clientsKey });
    },
  });
}

/** Registra un pago de suscripción e invalida el detalle del cliente y la lista. */
export function useRegisterPayment() {
  const gateway = useClientsGateway();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clientId, input }: { clientId: string; input: PaymentInput }) =>
      gateway.registerPayment(clientId, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: clientKey(variables.clientId) });
      queryClient.invalidateQueries({ queryKey: clientsKey });
    },
  });
}
