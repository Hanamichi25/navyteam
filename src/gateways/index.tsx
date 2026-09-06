import { createContext, useContext, useMemo, type ReactNode } from 'react';

import type { ClientsGateway } from '@/features/clients/gateway';
import { createSupabaseClientsGateway } from '@/features/clients/supabase/clientsGateway.supabase';
import type { DashboardGateway } from '@/features/dashboard/gateway';
import { createSupabaseDashboardGateway } from '@/features/dashboard/supabase/dashboardGateway.supabase';
import type { ExercisesGateway } from '@/features/exercises/gateway';
import { createSupabaseExercisesGateway } from '@/features/exercises/supabase/exercisesGateway.supabase';
import type { FoodsGateway } from '@/features/foods/gateway';
import { createSupabaseFoodsGateway } from '@/features/foods/supabase/foodsGateway.supabase';
import type { MessagesGateway } from '@/features/messages/gateway';
import { createSupabaseMessagesGateway } from '@/features/messages/supabase/messagesGateway.supabase';
import type { NotificationsGateway } from '@/features/notifications/gateway';
import { createSupabaseNotificationsGateway } from '@/features/notifications/supabase/notificationsGateway.supabase';
import type { NutritionGateway } from '@/features/nutrition/gateway';
import { createSupabaseNutritionGateway } from '@/features/nutrition/supabase/nutritionGateway.supabase';
import type { RoutinesGateway } from '@/features/routines/gateway';
import { createSupabaseRoutinesGateway } from '@/features/routines/supabase/routinesGateway.supabase';
import type { WorkoutsGateway } from '@/features/workouts/gateway';
import { createSupabaseWorkoutsGateway } from '@/features/workouts/supabase/workoutsGateway.supabase';

/**
 * Contexto agregado que inyecta la implementación de cada Gateway.
 *
 * Toda la data va contra Supabase (`.env` con `EXPO_PUBLIC_SUPABASE_URL` +
 * `_ANON_KEY` es obligatorio — `src/lib/supabase.ts` lanza si falta). Ya no
 * hay capa mock.
 */
interface Gateways {
  clients: ClientsGateway;
  routines: RoutinesGateway;
  nutrition: NutritionGateway;
  dashboard: DashboardGateway;
  exercises: ExercisesGateway;
  foods: FoodsGateway;
  workouts: WorkoutsGateway;
  messages: MessagesGateway;
  notifications: NotificationsGateway;
}

function createGateways(): Gateways {
  return {
    clients: createSupabaseClientsGateway(),
    routines: createSupabaseRoutinesGateway(),
    nutrition: createSupabaseNutritionGateway(),
    dashboard: createSupabaseDashboardGateway(),
    exercises: createSupabaseExercisesGateway(),
    foods: createSupabaseFoodsGateway(),
    workouts: createSupabaseWorkoutsGateway(),
    messages: createSupabaseMessagesGateway(),
    notifications: createSupabaseNotificationsGateway(),
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

export function useFoodsGateway(): FoodsGateway {
  return useGateways().foods;
}

export function useWorkoutsGateway(): WorkoutsGateway {
  return useGateways().workouts;
}

export function useMessagesGateway(): MessagesGateway {
  return useGateways().messages;
}

export function useNotificationsGateway(): NotificationsGateway {
  return useGateways().notifications;
}
