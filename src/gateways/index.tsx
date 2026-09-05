import { createContext, useContext, useMemo, type ReactNode } from 'react';

import type { ClientsGateway } from '@/features/clients/gateway';
import { createMockClientsGateway } from '@/features/clients/mocks/clientsGateway.mock';
import { createSupabaseClientsGateway } from '@/features/clients/supabase/clientsGateway.supabase';
import type { DashboardGateway } from '@/features/dashboard/gateway';
import { createMockDashboardGateway } from '@/features/dashboard/mocks/dashboardGateway.mock';
import { createSupabaseDashboardGateway } from '@/features/dashboard/supabase/dashboardGateway.supabase';
import type { ExercisesGateway } from '@/features/exercises/gateway';
import { createMockExercisesGateway } from '@/features/exercises/mocks/exercisesGateway.mock';
import { createSupabaseExercisesGateway } from '@/features/exercises/supabase/exercisesGateway.supabase';
import type { MessagesGateway } from '@/features/messages/gateway';
import { createMockMessagesGateway } from '@/features/messages/mocks/messagesGateway.mock';
import { createSupabaseMessagesGateway } from '@/features/messages/supabase/messagesGateway.supabase';
import type { NutritionGateway } from '@/features/nutrition/gateway';
import { createMockNutritionGateway } from '@/features/nutrition/mocks/nutritionGateway.mock';
import { createSupabaseNutritionGateway } from '@/features/nutrition/supabase/nutritionGateway.supabase';
import type { RoutinesGateway } from '@/features/routines/gateway';
import { createMockRoutinesGateway } from '@/features/routines/mocks/routinesGateway.mock';
import { createSupabaseRoutinesGateway } from '@/features/routines/supabase/routinesGateway.supabase';
import type { WorkoutsGateway } from '@/features/workouts/gateway';
import { createMockWorkoutsGateway } from '@/features/workouts/mocks/workoutsGateway.mock';
import { createSupabaseWorkoutsGateway } from '@/features/workouts/supabase/workoutsGateway.supabase';

/**
 * Contexto agregado que inyecta la implementación de cada Gateway.
 *
 * Si `EXPO_PUBLIC_SUPABASE_URL` está presente (ver `.env`), se usan las
 * implementaciones reales de Supabase (Fase 10); si no, los mocks sobre
 * AsyncStorage (desarrollo offline / tests). Mismo patrón que
 * `configureAuthGateway` en `app/_layout.tsx`.
 */
interface Gateways {
  clients: ClientsGateway;
  routines: RoutinesGateway;
  nutrition: NutritionGateway;
  dashboard: DashboardGateway;
  exercises: ExercisesGateway;
  workouts: WorkoutsGateway;
  messages: MessagesGateway;
}

const useSupabase = Boolean(process.env.EXPO_PUBLIC_SUPABASE_URL);

function createGateways(): Gateways {
  if (useSupabase) {
    return {
      clients: createSupabaseClientsGateway(),
      routines: createSupabaseRoutinesGateway(),
      nutrition: createSupabaseNutritionGateway(),
      dashboard: createSupabaseDashboardGateway(),
      exercises: createSupabaseExercisesGateway(),
      workouts: createSupabaseWorkoutsGateway(),
      messages: createSupabaseMessagesGateway(),
    };
  }
  return {
    clients: createMockClientsGateway(),
    routines: createMockRoutinesGateway(),
    nutrition: createMockNutritionGateway(),
    dashboard: createMockDashboardGateway(),
    exercises: createMockExercisesGateway(),
    workouts: createMockWorkoutsGateway(),
    messages: createMockMessagesGateway(),
  };
}

const GatewaysContext = createContext<Gateways | null>(null);

export function GatewaysProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const gateways = useMemo<Gateways>(createGateways, []);

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

export function useMessagesGateway(): MessagesGateway {
  return useGateways().messages;
}
