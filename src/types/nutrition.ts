/**
 * Tipos del dominio "planes de alimentación".
 * La forma anticipa un endpoint tipo `GET /nutrition-plans`.
 */

export type NutritionCategory = 'weight_loss' | 'volume' | 'maintenance';

/** Distribución de macronutrientes en porcentaje (deben sumar 100). */
export interface Macros {
  /** Proteína (%). */
  proteinPct: number;
  /** Carbohidratos (%). */
  carbsPct: number;
  /** Grasas (%). */
  fatPct: number;
}

/** Plan de alimentación del catálogo del entrenador. */
export interface NutritionPlan {
  id: string;
  name: string;
  category: NutritionCategory;
  kcalPerDay: number;
  macros: Macros;
  /** Cuántos clientes tienen este plan asignado. */
  assignedCount: number;
  /** Imagen de portada (URL remota en esta fase). */
  imageUrl: string;
}

/**
 * Campos editables al crear/actualizar un plan de alimentación.
 * TODO(Fase 5): añadir el campo de notas de texto libre del editor real.
 */
export type NutritionPlanInput = Omit<NutritionPlan, 'id' | 'assignedCount' | 'imageUrl'>;
