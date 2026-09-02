import { createContext, useContext, useMemo, type ReactNode } from 'react';

import type { ClientsGateway } from '@/features/clients/gateway';
import { createMockClientsGateway } from '@/features/clients/mocks/clientsGateway.mock';
import type { DashboardGateway } from '@/features/dashboard/gateway';
import { createMockDashboardGateway } from '@/features/dashboard/mocks/dashboardGateway.mock';
import type { ExercisesGateway } from '@/features/exercises/gateway';
import { createMockExercisesGateway } from '@/features/exercises/mocks/exercisesGateway.mock';
import type { NutritionGateway } from '@/features/nutrition/gateway';
import { createMockNutritionGateway } from '@/features/nutrition/mocks/nutritionGateway.mock';
import type { RoutinesGateway } from '@/features/routines/gateway';
import { createMockRoutinesGateway } from '@/features/routines/mocks/routinesGateway.mock';
import type { WorkoutsGateway } from '@/features/workouts/gateway';
import { createMockWorkoutsGateway } from '@/features/workouts/mocks/workoutsGateway.mock';

/**
 * Contexto agregado que inyecta la implementación de cada Gateway. Hoy son
 * todos mocks; el swap a backend real (Fase 9) se hace aquí, sin tocar los
 * hooks de cada feature.
 */
interface Gateways {
  clients: ClientsGateway;
  routines: RoutinesGateway;
  nutrition: NutritionGateway;
  dashboard: DashboardGateway;
  exercises: ExercisesGateway;
  workouts: WorkoutsGateway;
}

const GatewaysContext = createContext<Gateways | null>(null);

export function GatewaysProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const gateways = useMemo<Gateways>(
    () => ({
      clients: createMockClientsGateway(),
      routines: createMockRoutinesGateway(),
      nutrition: createMockNutritionGateway(),
      dashboard: createMockDashboardGateway(),
      exercises: createMockExercisesGateway(),
      workouts: createMockWorkoutsGateway(),
    }),
    [],
  );

  return <GatewaysContext.Provider value={gateways}>{children}</GatewaysContext.Provider>;
}

function useGateways(): Gateways {
  const gateways = useContext(GatewaysContext);
  if (!gateways) {
    throw new Error('useGateways debe usarse dentro de <GatewaysProvider>');
  }
  return gateways;
}

export function useClientsGateway(): ClientsGateway {
  return useGateways().clients;
}

export function useRoutinesGateway(): RoutinesGateway {
  return useGateways().routines;
}

export function useNutritionGateway(): NutritionGateway {
  return useGateways().nutrition;
}

export function useDashboardGateway(): DashboardGateway {
  return useGateways().dashboard;
}

export function useExercisesGateway(): ExercisesGateway {
  return useGateways().exercises;
}

export function useWorkoutsGateway(): WorkoutsGateway {
  return useGateways().workouts;
}
