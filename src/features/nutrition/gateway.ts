import type { NutritionPlan, NutritionPlanDetail, NutritionPlanInput } from '@/types/nutrition';

/**
 * Interfaz de infraestructura que necesita el módulo "alimentación".
 *
 * Desde la Fase 12 el plan se arma por comidas: `create`/`update` reciben
 * `meals` (semántica replace-all), y `get(id)` devuelve el detalle con las
 * comidas y los totales calculados.
 */
export interface NutritionGateway {
  list(): Promise<NutritionPlan[]>;
  get(id: string): Promise<NutritionPlanDetail>;
  create(input: NutritionPlanInput): Promise<NutritionPlanDetail>;
  update(id: string, input: Partial<NutritionPlanInput>): Promise<NutritionPlanDetail>;
  remove(id: string): Promise<void>;
}
