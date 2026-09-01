export { AssignedRoutineRow } from './components/AssignedRoutineRow';
export { ClientListItem } from './components/ClientListItem';
export { WeightProgressCard } from './components/WeightProgressCard';
export {
  useAssignPlanToClient,
  useAssignRoutineToClient,
  useClient,
  useClients,
  useCreateClient,
  useRemoveClient,
  useUnassignPlanFromClient,
  useUnassignRoutineFromClient,
  useUpdateClient,
} from './hooks/useClients';
export type { ClientsGateway } from './gateway';
export { CLIENT_GOAL_LABEL, CLIENT_GOAL_TONE } from './labels';
