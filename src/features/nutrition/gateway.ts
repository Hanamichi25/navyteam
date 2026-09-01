import type { NutritionPlan, NutritionPlanInput } from '@/types/nutrition';

/**
 * Interfaz de infraestructura que necesita el módulo "alimentación".
 * TODO(backend): la implementación real (Fase 9) habla contra la API/BD.
 */
export interface NutritionGateway {
  list(): Promise<NutritionPlan[]>;
  create(input: NutritionPlanInput): Promise<NutritionPlan>;
  update(id: string, input: Partial<NutritionPlanInput>): Promise<NutritionPlan>;
  remove(id: string): Promise<void>;
}
